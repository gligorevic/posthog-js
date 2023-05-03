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
import { _each, _HTTPBuildQuery, logger } from './utils';
import Config from './config';
export var addParamsToURL = function (url, urlQueryArgs, parameterOptions) {
    var e_1, _a;
    var args = urlQueryArgs || {};
    args['ip'] = parameterOptions['ip'] ? 1 : 0;
    args['_'] = new Date().getTime().toString();
    args['ver'] = Config.LIB_VERSION;
    var halves = url.split('?');
    if (halves.length > 1) {
        var params = halves[1].split('&');
        try {
            for (var params_1 = __values(params), params_1_1 = params_1.next(); !params_1_1.done; params_1_1 = params_1.next()) {
                var p = params_1_1.value;
                var key = p.split('=')[0];
                if (args[key]) {
                    delete args[key];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (params_1_1 && !params_1_1.done && (_a = params_1.return)) _a.call(params_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    var argSeparator = url.indexOf('?') > -1 ? '&' : '?';
    return url + argSeparator + _HTTPBuildQuery(args);
};
export var encodePostData = function (data, options) {
    if (options.blob && data.buffer) {
        return new Blob([data.buffer], { type: 'text/plain' });
    }
    if (options.sendBeacon || options.blob) {
        var body = encodePostData(data, { method: 'POST' });
        return new Blob([body], { type: 'application/x-www-form-urlencoded' });
    }
    if (options.method !== 'POST') {
        return null;
    }
    var body_data;
    var isUint8Array = function (d) { return Object.prototype.toString.call(d) === '[object Uint8Array]'; };
    if (Array.isArray(data) || isUint8Array(data)) {
        // TODO: eh? passing an Array here?
        body_data = 'data=' + encodeURIComponent(data);
    }
    else {
        body_data = 'data=' + encodeURIComponent(data.data);
    }
    if ('compression' in data && data.compression) {
        body_data += '&compression=' + data.compression;
    }
    return body_data;
};
export var xhr = function (_a) {
    var url = _a.url, data = _a.data, headers = _a.headers, options = _a.options, captureMetrics = _a.captureMetrics, callback = _a.callback, retriesPerformedSoFar = _a.retriesPerformedSoFar, retryQueue = _a.retryQueue, onXHRError = _a.onXHRError, _b = _a.timeout, timeout = _b === void 0 ? 10000 : _b;
    var req = new XMLHttpRequest();
    req.open(options.method || 'GET', url, true);
    var body = encodePostData(data, options);
    captureMetrics.incr('_send_request');
    captureMetrics.incr('_send_request_inflight');
    _each(headers, function (headerValue, headerName) {
        req.setRequestHeader(headerName, headerValue);
    });
    if (options.method === 'POST' && !options.blob) {
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    req.timeout = timeout;
    // send the ph_optout cookie
    // withCredentials cannot be modified until after calling .open on Android and Mobile Safari
    req.withCredentials = true;
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            captureMetrics.incr("xhr-response");
            captureMetrics.incr("xhr-response-".concat(req.status));
            captureMetrics.decr('_send_request_inflight');
            // XMLHttpRequest.DONE == 4, except in safari 4
            if (req.status === 200) {
                if (callback) {
                    var response = void 0;
                    try {
                        response = JSON.parse(req.responseText);
                    }
                    catch (e) {
                        logger.error(e);
                        return;
                    }
                    callback(response);
                }
            }
            else {
                if (typeof onXHRError === 'function') {
                    onXHRError(req);
                }
                // don't retry certain errors
                if ([401, 403, 404, 500].indexOf(req.status) < 0) {
                    retryQueue.enqueue({
                        url: url,
                        data: data,
                        options: options,
                        headers: headers,
                        retriesPerformedSoFar: (retriesPerformedSoFar || 0) + 1,
                        callback: callback,
                    });
                }
                if (callback) {
                    callback({ status: 0 });
                }
            }
        }
    };
    req.send(body);
};
//# sourceMappingURL=send-request.js.map