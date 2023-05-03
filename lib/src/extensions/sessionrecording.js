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
import { CONSOLE_LOG_RECORDING_ENABLED_SERVER_SIDE, SESSION_RECORDING_ENABLED_SERVER_SIDE, SESSION_RECORDING_RECORDER_VERSION_SERVER_SIDE, } from '../posthog-persistence';
import { filterDataURLsFromLargeDataObjects, FULL_SNAPSHOT_EVENT_TYPE, INCREMENTAL_SNAPSHOT_EVENT_TYPE, META_EVENT_TYPE, MUTATION_SOURCE_TYPE, truncateLargeConsoleLogs, } from './sessionrecording-utils';
import Config from '../config';
import { logger, loadScript } from '../utils';
var BASE_ENDPOINT = '/e/';
var SessionRecording = /** @class */ (function () {
    function SessionRecording(instance) {
        this.instance = instance;
        this.captureStarted = false;
        this.snapshots = [];
        this.emit = false; // Controls whether data is sent to the server or not
        this.endpoint = BASE_ENDPOINT;
        this.stopRrweb = undefined;
        this.windowId = null;
        this.sessionId = null;
        this.receivedDecide = false;
    }
    SessionRecording.prototype.startRecordingIfEnabled = function () {
        if (this.isRecordingEnabled()) {
            this.startCaptureAndTrySendingQueuedSnapshots();
        }
        else {
            this.stopRecording();
        }
    };
    SessionRecording.prototype.started = function () {
        return this.captureStarted;
    };
    SessionRecording.prototype.stopRecording = function () {
        if (this.captureStarted && this.stopRrweb) {
            this.stopRrweb();
            this.stopRrweb = undefined;
            this.captureStarted = false;
        }
    };
    SessionRecording.prototype.isRecordingEnabled = function () {
        var enabled_server_side = !!this.instance.get_property(SESSION_RECORDING_ENABLED_SERVER_SIDE);
        var enabled_client_side = !this.instance.get_config('disable_session_recording');
        return enabled_server_side && enabled_client_side;
    };
    SessionRecording.prototype.isConsoleLogCaptureEnabled = function () {
        var enabled_server_side = !!this.instance.get_property(CONSOLE_LOG_RECORDING_ENABLED_SERVER_SIDE);
        var enabled_client_side = this.instance.get_config('enable_recording_console_log');
        return enabled_client_side !== null && enabled_client_side !== void 0 ? enabled_client_side : enabled_server_side;
    };
    SessionRecording.prototype.getRecordingVersion = function () {
        var _a;
        var recordingVersion_server_side = this.instance.get_property(SESSION_RECORDING_RECORDER_VERSION_SERVER_SIDE);
        var recordingVersion_client_side = (_a = this.instance.get_config('session_recording')) === null || _a === void 0 ? void 0 : _a.recorderVersion;
        return recordingVersion_client_side || recordingVersion_server_side || 'v1';
    };
    SessionRecording.prototype.afterDecideResponse = function (response) {
        var _a;
        var _b, _c, _d, _e, _f;
        this.receivedDecide = true;
        if (this.instance.persistence) {
            this.instance.persistence.register((_a = {},
                _a[SESSION_RECORDING_ENABLED_SERVER_SIDE] = !!response['sessionRecording'],
                _a[CONSOLE_LOG_RECORDING_ENABLED_SERVER_SIDE] = (_b = response.sessionRecording) === null || _b === void 0 ? void 0 : _b.consoleLogRecordingEnabled,
                _a[SESSION_RECORDING_RECORDER_VERSION_SERVER_SIDE] = (_c = response.sessionRecording) === null || _c === void 0 ? void 0 : _c.recorderVersion,
                _a));
        }
        if ((_d = response.sessionRecording) === null || _d === void 0 ? void 0 : _d.endpoint) {
            this.endpoint = (_e = response.sessionRecording) === null || _e === void 0 ? void 0 : _e.endpoint;
        }
        if ((_f = response.sessionRecording) === null || _f === void 0 ? void 0 : _f.recorderVersion) {
            this.recorderVersion = response.sessionRecording.recorderVersion;
        }
        this.startRecordingIfEnabled();
    };
    SessionRecording.prototype.startCaptureAndTrySendingQueuedSnapshots = function () {
        var _this = this;
        // Only submit data after we've received a decide response to account for
        // changing endpoints and the feature being disabled on the server side.
        if (this.receivedDecide) {
            this.emit = true;
            this.snapshots.forEach(function (properties) { return _this._captureSnapshot(properties); });
        }
        this._startCapture();
    };
    SessionRecording.prototype._startCapture = function () {
        var _this = this;
        // According to the rrweb docs, rrweb is not supported on IE11 and below:
        // "rrweb does not support IE11 and below because it uses the MutationObserver API which was supported by these browsers."
        // https://github.com/rrweb-io/rrweb/blob/master/guide.md#compatibility-note
        //
        // However, MutationObserver does exist on IE11, it just doesn't work well and does not detect all changes.
        // Instead, when we load "recorder.js", the first JS error is about "Object.assign" being undefined.
        // Thus instead of MutationObserver, we look for this function and block recording if it's undefined.
        if (typeof Object.assign === 'undefined') {
            return;
        }
        // We do not switch recorder versions midway through a recording.
        if (this.captureStarted || this.instance.get_config('disable_session_recording')) {
            return;
        }
        this.captureStarted = true;
        var recorderJS = this.getRecordingVersion() === 'v2' ? 'recorder-v2.js' : 'recorder.js';
        // If recorder.js is already loaded (if array.full.js snippet is used or posthog-js/dist/recorder is
        // imported) or matches the requested recorder version, don't load script. Otherwise, remotely import
        // recorder.js from cdn since it hasn't been loaded.
        if (this.instance.__loaded_recorder_version !== this.getRecordingVersion()) {
            loadScript(this.instance.get_config('api_host') + "/static/".concat(recorderJS, "?v=").concat(Config.LIB_VERSION), function (err) {
                if (err) {
                    return logger.error("Could not load ".concat(recorderJS), err);
                }
                _this._onScriptLoaded();
            });
        }
        else {
            this._onScriptLoaded();
        }
    };
    SessionRecording.prototype._updateWindowAndSessionIds = function (event) {
        var _a, _b;
        // Some recording events are triggered by non-user events (e.g. "X minutes ago" text updating on the screen).
        // We don't want to extend the session or trigger a new session in these cases. These events are designated by event
        // type -> incremental update, and source -> mutation.
        var isNotUserInteraction = event.type === INCREMENTAL_SNAPSHOT_EVENT_TYPE && ((_a = event.data) === null || _a === void 0 ? void 0 : _a.source) === MUTATION_SOURCE_TYPE;
        var _c = this.instance.sessionManager.checkAndGetSessionAndWindowId(isNotUserInteraction, event.timestamp), windowId = _c.windowId, sessionId = _c.sessionId;
        // Event types FullSnapshot and Meta mean we're already in the process of sending a full snapshot
        if (this.captureStarted &&
            (this.windowId !== windowId || this.sessionId !== sessionId) &&
            [FULL_SNAPSHOT_EVENT_TYPE, META_EVENT_TYPE].indexOf(event.type) === -1) {
            try {
                (_b = this.rrwebRecord) === null || _b === void 0 ? void 0 : _b.takeFullSnapshot();
            }
            catch (e) {
                // Sometimes a race can occur where the recorder is not fully started yet, so we can't take a full snapshot.
                logger.error('Error taking full snapshot.', e);
            }
        }
        this.windowId = windowId;
        this.sessionId = sessionId;
    };
    SessionRecording.prototype._onScriptLoaded = function () {
        var e_1, _a;
        var _this = this;
        // rrweb config info: https://github.com/rrweb-io/rrweb/blob/7d5d0033258d6c29599fb08412202d9a2c7b9413/src/record/index.ts#L28
        var sessionRecordingOptions = {
            // select set of rrweb config options we expose to our users
            // see https://github.com/rrweb-io/rrweb/blob/master/guide.md
            blockClass: 'ph-no-capture',
            blockSelector: undefined,
            ignoreClass: 'ph-ignore-input',
            maskTextClass: 'ph-mask',
            maskTextSelector: undefined,
            maskAllInputs: true,
            maskInputOptions: {},
            maskInputFn: undefined,
            slimDOMOptions: {},
            collectFonts: false,
            inlineStylesheet: true,
        };
        // We switched from loading all of rrweb to just the record part, but
        // keep backwards compatibility if someone hasn't upgraded PostHog
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.rrwebRecord = window.rrweb ? window.rrweb.record : window.rrwebRecord;
        // only allows user to set our 'allowlisted' options
        var userSessionRecordingOptions = this.instance.get_config('session_recording');
        try {
            for (var _b = __values(Object.entries(userSessionRecordingOptions || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (key in sessionRecordingOptions) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    sessionRecordingOptions[key] = value;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!this.rrwebRecord) {
            logger.error('onScriptLoaded was called but rrwebRecord is not available. This indicates something has gone wrong.');
            return;
        }
        this.stopRrweb = this.rrwebRecord(__assign({ emit: function (event) {
                _this.onRRwebEmit(event);
            }, plugins: window.rrwebConsoleRecord && this.isConsoleLogCaptureEnabled()
                ? [window.rrwebConsoleRecord.getRecordConsolePlugin()]
                : [] }, sessionRecordingOptions));
        // :TRICKY: rrweb does not capture navigation within SPA-s, so hook into our $pageview events to get access to all events.
        //   Dropping the initial event is fine (it's always captured by rrweb).
        this.instance._addCaptureHook(function (eventName) {
            var _a;
            // If anything could go wrong here it has the potential to block the main loop so we catch all errors.
            try {
                if (eventName === '$pageview') {
                    (_a = _this.rrwebRecord) === null || _a === void 0 ? void 0 : _a.addCustomEvent('$pageview', { href: window.location.href });
                }
            }
            catch (e) {
                logger.error('Could not add $pageview to rrweb session', e);
            }
        });
    };
    SessionRecording.prototype.onRRwebEmit = function (event) {
        event = truncateLargeConsoleLogs(filterDataURLsFromLargeDataObjects(event));
        this._updateWindowAndSessionIds(event);
        var properties = {
            $snapshot_data: event,
            $session_id: this.sessionId,
            $window_id: this.windowId,
        };
        this.instance._captureMetrics.incr('rrweb-record');
        this.instance._captureMetrics.incr("rrweb-record-".concat(event.type));
        if (this.emit) {
            this._captureSnapshot(properties);
        }
        else {
            this.snapshots.push(properties);
        }
    };
    SessionRecording.prototype._captureSnapshot = function (properties) {
        // :TRICKY: Make sure we batch these requests, use a custom endpoint and don't truncate the strings.
        this.instance.capture('$snapshot', properties, {
            transport: 'XHR',
            method: 'POST',
            endpoint: this.endpoint,
            _noTruncate: true,
            _batchKey: 'sessionRecording',
            _metrics: {
                rrweb_full_snapshot: properties.$snapshot_data.type === FULL_SNAPSHOT_EVENT_TYPE,
            },
        });
    };
    return SessionRecording;
}());
export { SessionRecording };
//# sourceMappingURL=sessionrecording.js.map