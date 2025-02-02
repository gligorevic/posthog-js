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
import { RequestQueueScaffold } from './base-request-queue';
import { encodePostData, xhr } from './send-request';
import Config from './config';
var RetryQueue = /** @class */ (function (_super) {
    __extends(RetryQueue, _super);
    function RetryQueue(captureMetrics, onXHRError) {
        var _this = _super.call(this) || this;
        _this.captureMetrics = captureMetrics;
        _this.isPolling = false;
        _this.queue = [];
        _this.areWeOnline = true;
        _this.onXHRError = onXHRError;
        if (typeof window !== 'undefined' && 'onLine' in window.navigator) {
            _this.areWeOnline = window.navigator.onLine;
            window.addEventListener('online', function () {
                _this._handleWeAreNowOnline();
            });
            window.addEventListener('offline', function () {
                _this.areWeOnline = false;
            });
        }
        return _this;
    }
    RetryQueue.prototype.enqueue = function (requestData) {
        var retriesPerformedSoFar = requestData.retriesPerformedSoFar || 0;
        if (retriesPerformedSoFar >= 10) {
            return;
        }
        var msToNextRetry = 3000 * Math.pow(2, retriesPerformedSoFar);
        var retryAt = new Date(Date.now() + msToNextRetry);
        console.warn("Enqueued failed request for retry in ".concat(msToNextRetry));
        this.queue.push({ retryAt: retryAt, requestData: requestData });
        if (!this.isPolling) {
            this.isPolling = true;
            this.poll();
        }
    };
    RetryQueue.prototype.poll = function () {
        var _this = this;
        this._poller && clearTimeout(this._poller);
        this._poller = setTimeout(function () {
            if (_this.areWeOnline && _this.queue.length > 0) {
                _this.flush();
            }
            _this.poll();
        }, this._pollInterval);
    };
    RetryQueue.prototype.flush = function () {
        var e_1, _a;
        // using Date.now to make tests easier as recommended here https://codewithhugo.com/mocking-the-current-date-in-jest-tests/
        var now = new Date(Date.now());
        var toFlush = this.queue.filter(function (_a) {
            var retryAt = _a.retryAt;
            return retryAt < now;
        });
        if (toFlush.length > 0) {
            this.queue = this.queue.filter(function (_a) {
                var retryAt = _a.retryAt;
                return retryAt >= now;
            });
            try {
                for (var toFlush_1 = __values(toFlush), toFlush_1_1 = toFlush_1.next(); !toFlush_1_1.done; toFlush_1_1 = toFlush_1.next()) {
                    var requestData = toFlush_1_1.value.requestData;
                    this._executeXhrRequest(requestData);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (toFlush_1_1 && !toFlush_1_1.done && (_a = toFlush_1.return)) _a.call(toFlush_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    RetryQueue.prototype.unload = function () {
        var e_2, _a;
        if (this._poller) {
            clearTimeout(this._poller);
            this._poller = undefined;
        }
        try {
            for (var _b = __values(this.queue), _c = _b.next(); !_c.done; _c = _b.next()) {
                var requestData = _c.value.requestData;
                var url = requestData.url, data = requestData.data, options = requestData.options;
                try {
                    window.navigator.sendBeacon(url, encodePostData(data, __assign(__assign({}, options), { sendBeacon: true })));
                }
                catch (e) {
                    // Note sendBeacon automatically retries, and after the first retry it will loose reference to contextual `this`.
                    // This means in some cases `this.getConfig` will be undefined.
                    if (Config.DEBUG) {
                        console.error(e);
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.queue = [];
    };
    RetryQueue.prototype._executeXhrRequest = function (_a) {
        var url = _a.url, data = _a.data, options = _a.options, headers = _a.headers, callback = _a.callback, retriesPerformedSoFar = _a.retriesPerformedSoFar;
        xhr({
            url: url,
            data: data || {},
            options: options || {},
            headers: headers || {},
            retriesPerformedSoFar: retriesPerformedSoFar || 0,
            callback: callback,
            captureMetrics: this.captureMetrics,
            retryQueue: this,
            onXHRError: this.onXHRError,
        });
    };
    RetryQueue.prototype._handleWeAreNowOnline = function () {
        this.areWeOnline = true;
        this.flush();
    };
    return RetryQueue;
}(RequestQueueScaffold));
export { RetryQueue };
//# sourceMappingURL=retry-queue.js.map