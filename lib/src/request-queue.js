var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { RequestQueueScaffold } from './base-request-queue';
import { _each } from './utils';
var RequestQueue = /** @class */ (function (_super) {
    __extends(RequestQueue, _super);
    function RequestQueue(captureMetrics, handlePollRequest, pollInterval) {
        if (pollInterval === void 0) { pollInterval = 3000; }
        var _this = _super.call(this, pollInterval) || this;
        _this.handlePollRequest = handlePollRequest;
        _this.captureMetrics = captureMetrics;
        return _this;
    }
    RequestQueue.prototype.enqueue = function (url, data, options) {
        this.captureMetrics.incr('batch-enqueue');
        this._event_queue.push({ url: url, data: data, options: options });
        if (!this.isPolling) {
            this.isPolling = true;
            this.poll();
        }
    };
    RequestQueue.prototype.poll = function () {
        var _this = this;
        clearTimeout(this._poller);
        this._poller = setTimeout(function () {
            if (_this._event_queue.length > 0) {
                var requests = _this.formatQueue();
                var _loop_1 = function (key) {
                    var _a = requests[key], url = _a.url, data = _a.data, options = _a.options;
                    _each(data, function (_, dataKey) {
                        data[dataKey]['offset'] = Math.abs(data[dataKey]['timestamp'] - _this.getTime());
                        delete data[dataKey]['timestamp'];
                    });
                    _this.handlePollRequest(url, data, options);
                    _this.captureMetrics.incr('batch-requests');
                    _this.captureMetrics.incr("batch-requests-".concat(url.slice(url.length - 2)));
                    _this.captureMetrics.incr('batch-handle', data.length);
                    _this.captureMetrics.incr("batch-handle-".concat(url.slice(url.length - 2)), data.length);
                };
                for (var key in requests) {
                    _loop_1(key);
                }
                _this._event_queue.length = 0; // flush the _event_queue
                _this._empty_queue_count = 0;
            }
            else {
                _this._empty_queue_count++;
            }
            /**
             * _empty_queue_count will increment each time the queue is polled
             *  and it is empty. To avoid empty polling (user went idle, stepped away from comp)
             *  we can turn it off with the isPolling flag.
             *
             * Polling will be re enabled when the next time PostHogLib.capture is called with
             *  an event that should be added to the event queue.
             */
            if (_this._empty_queue_count > 4) {
                _this.isPolling = false;
                _this._empty_queue_count = 0;
            }
            if (_this.isPolling) {
                _this.poll();
            }
        }, this._pollInterval);
    };
    RequestQueue.prototype.updateUnloadMetrics = function () {
        var requests = this.formatQueue();
        for (var key in requests) {
            var _a = requests[key], url = _a.url, data = _a.data;
            this.captureMetrics.incr('batch-unload-requests');
            this.captureMetrics.incr("batch-unload-requests-".concat(url.slice(url.length - 2)));
            this.captureMetrics.incr('batch-unload', data.length);
            this.captureMetrics.incr("batch-unload-".concat(url.slice(url.length - 2)), data.length);
        }
    };
    RequestQueue.prototype.unload = function () {
        var _this = this;
        clearTimeout(this._poller);
        var requests = this._event_queue.length > 0 ? this.formatQueue() : {};
        this._event_queue.length = 0;
        var requestValues = Object.values(requests);
        // Always force events to be sent before recordings, as events are more important, and recordings are bigger and thus less likely to arrive
        var sortedRequests = __spreadArray(__spreadArray([], __read(requestValues.filter(function (r) { return r.url.indexOf('/e') === 0; })), false), __read(requestValues.filter(function (r) { return r.url.indexOf('/e') !== 0; })), false);
        sortedRequests.map(function (_a) {
            var url = _a.url, data = _a.data, options = _a.options;
            _this.handlePollRequest(url, data, __assign(__assign({}, options), { transport: 'sendBeacon' }));
        });
    };
    RequestQueue.prototype.formatQueue = function () {
        var requests = {};
        _each(this._event_queue, function (request) {
            var url = request.url, data = request.data, options = request.options;
            var key = (options ? options._batchKey : null) || url;
            if (requests[key] === undefined) {
                requests[key] = { data: [], url: url, options: options };
            }
            // :TRICKY: Metrics-only code
            if (options &&
                requests[key].options &&
                requests[key].options._metrics &&
                !requests[key].options._metrics['rrweb_full_snapshot']) {
                ;
                requests[key].options._metrics['rrweb_full_snapshot'] =
                    options._metrics['rrweb_full_snapshot'];
            }
            requests[key].data.push(data);
        });
        return requests;
    };
    return RequestQueue;
}(RequestQueueScaffold));
export { RequestQueue };
//# sourceMappingURL=request-queue.js.map