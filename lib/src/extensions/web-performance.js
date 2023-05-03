var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { isLocalhost, logger } from '../utils';
var PERFORMANCE_EVENTS_MAPPING = {
    // BASE_PERFORMANCE_EVENT_COLUMNS
    entryType: 0,
    timeOrigin: 1,
    name: 2,
    // RESOURCE_EVENT_COLUMNS
    startTime: 3,
    redirectStart: 4,
    redirectEnd: 5,
    workerStart: 6,
    fetchStart: 7,
    domainLookupStart: 8,
    domainLookupEnd: 9,
    connectStart: 10,
    secureConnectionStart: 11,
    connectEnd: 12,
    requestStart: 13,
    responseStart: 14,
    responseEnd: 15,
    decodedBodySize: 16,
    encodedBodySize: 17,
    initiatorType: 18,
    nextHopProtocol: 19,
    renderBlockingStatus: 20,
    responseStatus: 21,
    transferSize: 22,
    // LARGEST_CONTENTFUL_PAINT_EVENT_COLUMNS
    element: 23,
    renderTime: 24,
    loadTime: 25,
    size: 26,
    id: 27,
    url: 28,
    // NAVIGATION_EVENT_COLUMNS
    domComplete: 29,
    domContentLoadedEvent: 30,
    domInteractive: 31,
    loadEventEnd: 32,
    loadEventStart: 33,
    redirectCount: 34,
    navigationType: 35,
    unloadEventEnd: 36,
    unloadEventStart: 37,
    // Added after v1
    duration: 39,
    timestamp: 40,
    // NOTE: CURRENTLY UNSUPPORTED
    // EVENT_TIMING_EVENT_COLUMNS
    // processingStart: null,
    // processingEnd: null,
    // MARK_AND_MEASURE_EVENT_COLUMNS
    // detail: null,
};
var ENTRY_TYPES_TO_OBSERVE = [
    // 'event', // This is too noisy as it covers all browser events
    'first-input',
    // 'mark', // Mark is used too liberally. We would need to filter for specific marks
    // 'measure', // Measure is used too liberally. We would need to filter for specific measures
    'navigation',
    'paint',
    'resource',
];
var PERFORMANCE_INGESTION_ENDPOINT = '/e/';
// Don't monitor posthog paths because then events cause performance events which are events and the snake eats its tail 😱
var POSTHOG_PATHS_TO_IGNORE = ['/s/', PERFORMANCE_INGESTION_ENDPOINT];
var WebPerformanceObserver = /** @class */ (function () {
    function WebPerformanceObserver(instance) {
        // Util to help developers working on this feature manually override
        this._forceAllowLocalhost = false;
        this.instance = instance;
    }
    WebPerformanceObserver.prototype.startObservingIfEnabled = function () {
        if (this.isEnabled()) {
            this.startObserving();
        }
        else {
            this.stopObserving();
        }
    };
    WebPerformanceObserver.prototype.startObserving = function () {
        var _this = this;
        if (this.observer) {
            return;
        }
        if (isLocalhost() && !this._forceAllowLocalhost) {
            logger.log('PostHog Peformance observer not started because we are on localhost.');
            return;
        }
        try {
            this.observer = new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (entry) {
                    _this._capturePerformanceEvent(entry);
                });
            });
            var entryTypes = PerformanceObserver.supportedEntryTypes.filter(function (x) { return ENTRY_TYPES_TO_OBSERVE.includes(x); });
            entryTypes.forEach(function (entryType) {
                var _a;
                (_a = _this.observer) === null || _a === void 0 ? void 0 : _a.observe({ type: entryType, buffered: true });
            });
        }
        catch (e) {
            console.error('PostHog failed to start performance observer', e);
            this.stopObserving();
        }
    };
    WebPerformanceObserver.prototype.stopObserving = function () {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }
    };
    WebPerformanceObserver.prototype.isObserving = function () {
        return !!this.observer;
    };
    WebPerformanceObserver.prototype.isEnabled = function () {
        var _a, _b;
        return (_b = (_a = this.instance.get_config('capture_performance')) !== null && _a !== void 0 ? _a : this.remoteEnabled) !== null && _b !== void 0 ? _b : false;
    };
    WebPerformanceObserver.prototype.afterDecideResponse = function (response) {
        this.remoteEnabled = response.capturePerformance || false;
        if (this.isEnabled()) {
            this.startObserving();
        }
    };
    WebPerformanceObserver.prototype._capturePerformanceEvent = function (event) {
        // NOTE: We don't want to capture our own request events.
        var e_1, _a, _b;
        if (event.name.startsWith(this.instance.get_config('api_host'))) {
            var path_1 = event.name.replace(this.instance.get_config('api_host'), '');
            if (POSTHOG_PATHS_TO_IGNORE.find(function (x) { return path_1.startsWith(x); })) {
                return;
            }
        }
        var eventJson = event.toJSON();
        var properties = {};
        // kudos to sentry javascript sdk for excellent background on why to use Date.now() here
        // https://github.com/getsentry/sentry-javascript/blob/e856e40b6e71a73252e788cd42b5260f81c9c88e/packages/utils/src/time.ts#L70
        var timeOrigin = Math.floor(Date.now() - performance.now());
        properties[PERFORMANCE_EVENTS_MAPPING['timeOrigin']] = timeOrigin;
        // clickhouse can't ingest timestamps that are floats
        // (in this case representing fractions of a millisecond we don't care about anyway)
        properties[PERFORMANCE_EVENTS_MAPPING['timestamp']] = Math.floor(timeOrigin + event.startTime);
        for (var key in PERFORMANCE_EVENTS_MAPPING) {
            if (eventJson[key] !== undefined) {
                properties[PERFORMANCE_EVENTS_MAPPING[key]] = eventJson[key];
            }
        }
        this.capturePerformanceEvent(properties);
        if (exposesServerTiming(event)) {
            try {
                for (var _c = __values(event.serverTiming || []), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var timing = _d.value;
                    this.capturePerformanceEvent((_b = {},
                        _b[PERFORMANCE_EVENTS_MAPPING['timeOrigin']] = timeOrigin,
                        _b[PERFORMANCE_EVENTS_MAPPING['timestamp']] = Math.floor(timeOrigin + event.startTime),
                        _b[PERFORMANCE_EVENTS_MAPPING['name']] = timing.name,
                        _b[PERFORMANCE_EVENTS_MAPPING['duration']] = timing.duration,
                        // the spec has a closed list of possible types
                        // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType
                        // but, we need to know this was a server timing so that we know to
                        // match it to the appropriate navigation or resource timing
                        // that matching will have to be on timestamp and $current_url
                        _b[PERFORMANCE_EVENTS_MAPPING['entryType']] = 'serverTiming',
                        _b));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    /**
     * :TRICKY: Make sure we batch these requests, and don't truncate the strings.
     */
    WebPerformanceObserver.prototype.capturePerformanceEvent = function (properties) {
        var _a;
        var timestamp = properties[PERFORMANCE_EVENTS_MAPPING['timestamp']];
        (_a = this.instance.sessionRecording) === null || _a === void 0 ? void 0 : _a.onRRwebEmit({
            type: 6,
            data: {
                plugin: 'posthog/network@1',
                payload: properties,
            },
            timestamp: timestamp,
        });
        // this.instance.capture('$performance_event', properties, {
        //     transport: 'XHR',
        //     method: 'POST',
        //     endpoint: PERFORMANCE_INGESTION_ENDPOINT,
        //     _noTruncate: true,
        //     _batchKey: 'performanceEvent',
        // })
    };
    return WebPerformanceObserver;
}());
export { WebPerformanceObserver };
/**
 *  Check if this PerformanceEntry is either a PerformanceResourceTiming or a PerformanceNavigationTiming
 *  NB PerformanceNavigationTiming extends PerformanceResourceTiming
 *  Here we don't care which interface it implements as both expose `serverTimings`
 */
var exposesServerTiming = function (event) {
    return event.entryType === 'navigation' || event.entryType === 'resource';
};
//# sourceMappingURL=web-performance.js.map