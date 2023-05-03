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
import { autocapture } from './autocapture';
import { _base64Encode, loadScript } from './utils';
var Decide = /** @class */ (function () {
    function Decide(instance) {
        this.instance = instance;
        // don't need to wait for `decide` to return if flags were provided on initialisation
        this.instance.decideEndpointWasHit = this.instance._hasBootstrappedFeatureFlags();
    }
    Decide.prototype.call = function () {
        var _this = this;
        /*
        Calls /decide endpoint to fetch options for autocapture, session recording, feature flags & compression.
        */
        var json_data = JSON.stringify({
            token: this.instance.get_config('token'),
            distinct_id: this.instance.get_distinct_id(),
            groups: this.instance.getGroups(),
        });
        var encoded_data = _base64Encode(json_data);
        this.instance._send_request("".concat(this.instance.get_config('api_host'), "/decide/?v=3"), { data: encoded_data, verbose: true }, { method: 'POST' }, function (response) { return _this.parseDecideResponse(response); });
    };
    Decide.prototype.parseDecideResponse = function (response) {
        var e_1, _a, e_2, _b;
        var _this = this;
        var _c, _d;
        if ((response === null || response === void 0 ? void 0 : response.status) === 0) {
            console.error('Failed to fetch feature flags from PostHog.');
            return;
        }
        this.instance.decideEndpointWasHit = true;
        if (!(document && document.body)) {
            console.log('document not ready yet, trying again in 500 milliseconds...');
            setTimeout(function () {
                _this.parseDecideResponse(response);
            }, 500);
            return;
        }
        this.instance.toolbar.afterDecideResponse(response);
        (_c = this.instance.sessionRecording) === null || _c === void 0 ? void 0 : _c.afterDecideResponse(response);
        autocapture.afterDecideResponse(response, this.instance);
        (_d = this.instance.webPerformance) === null || _d === void 0 ? void 0 : _d.afterDecideResponse(response);
        this.instance.featureFlags.receivedFeatureFlags(response);
        this.instance['compression'] = {};
        if (response['supportedCompression'] && !this.instance.get_config('disable_compression')) {
            var compression = {};
            try {
                for (var _e = __values(response['supportedCompression']), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var method = _f.value;
                    compression[method] = true;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.instance['compression'] = compression;
        }
        if (response['siteApps']) {
            if (this.instance.get_config('opt_in_site_apps')) {
                var apiHost = this.instance.get_config('api_host');
                var _loop_1 = function (id, url) {
                    var scriptUrl = [
                        apiHost,
                        apiHost[apiHost.length - 1] === '/' && url[0] === '/' ? url.substring(1) : url,
                    ].join('');
                    window["__$$ph_site_app_".concat(id)] = this_1.instance;
                    loadScript(scriptUrl, function (err) {
                        if (err) {
                            console.error("Error while initializing PostHog app with config id ".concat(id), err);
                        }
                    });
                };
                var this_1 = this;
                try {
                    for (var _g = __values(response['siteApps']), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var _j = _h.value, id = _j.id, url = _j.url;
                        _loop_1(id, url);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else if (response['siteApps'].length > 0) {
                console.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.');
            }
        }
    };
    return Decide;
}());
export { Decide };
//# sourceMappingURL=decide.js.map