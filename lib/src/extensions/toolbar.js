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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { _getHashParam, _register_event, loadScript, logger } from '../utils';
import { POSTHOG_MANAGED_HOSTS } from './cloud';
var Toolbar = /** @class */ (function () {
    function Toolbar(instance) {
        this.instance = instance;
    }
    Toolbar.prototype.afterDecideResponse = function (response) {
        var toolbarParams = response['toolbarParams'] ||
            response['editorParams'] ||
            (response['toolbarVersion'] ? { toolbarVersion: response['toolbarVersion'] } : {});
        if (response['isAuthenticated'] &&
            toolbarParams['toolbarVersion'] &&
            toolbarParams['toolbarVersion'].indexOf('toolbar') === 0) {
            this.loadToolbar(__assign(__assign({}, toolbarParams), { apiURL: this.instance.get_config('api_host') }));
        }
    };
    /**
     * To load the toolbar, we need an access token and other state. That state comes from one of three places:
     * 1. In the URL hash params
     * 2. From session storage under the key `toolbarParams` if the toolbar was initialized on a previous page
     */
    Toolbar.prototype.maybeLoadToolbar = function (location, localStorage, history) {
        if (location === void 0) { location = window.location; }
        if (localStorage === void 0) { localStorage = undefined; }
        if (history === void 0) { history = window.history; }
        try {
            // Before running the code we check if we can access localStorage, if not we opt-out
            if (!localStorage) {
                try {
                    window.localStorage.setItem('test', 'test');
                    window.localStorage.removeItem('test');
                }
                catch (error) {
                    return false;
                }
                // If localStorage was undefined, and localStorage is supported we set the default value
                localStorage = window.localStorage;
            }
            var stateHash = _getHashParam(location.hash, '__posthog') || _getHashParam(location.hash, 'state');
            var state = stateHash ? JSON.parse(decodeURIComponent(stateHash)) : null;
            var parseFromUrl = state && state['action'] === 'ph_authorize';
            var toolbarParams = void 0;
            if (parseFromUrl) {
                // happens if they are initializing the toolbar using an old snippet
                toolbarParams = state;
                toolbarParams.source = 'url';
                if (toolbarParams && Object.keys(toolbarParams).length > 0) {
                    if (state['desiredHash']) {
                        // hash that was in the url before the redirect
                        location.hash = state['desiredHash'];
                    }
                    else if (history) {
                        history.replaceState('', document.title, location.pathname + location.search); // completely remove hash
                    }
                    else {
                        location.hash = ''; // clear hash (but leaves # unfortunately)
                    }
                }
            }
            else {
                // get credentials from localStorage from a previous initialzation
                toolbarParams = JSON.parse(localStorage.getItem('_postHogToolbarParams') || '{}');
                toolbarParams.source = 'localstorage';
                // delete "add-action" or other intent from toolbarParams, otherwise we'll have the same intent
                // every time we open the page (e.g. you just visiting your own site an hour later)
                delete toolbarParams.userIntent;
            }
            if (!toolbarParams.apiURL) {
                toolbarParams.apiURL = this.instance.get_config('api_host');
            }
            if (toolbarParams['token'] && this.instance.get_config('token') === toolbarParams['token']) {
                this.loadToolbar(toolbarParams);
                return true;
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    };
    Toolbar.prototype.loadToolbar = function (params) {
        var _this = this;
        if (window['_postHogToolbarLoaded']) {
            return false;
        }
        // only load the toolbar once, even if there are multiple instances of PostHogLib
        ;
        window['_postHogToolbarLoaded'] = true;
        // the toolbar does not use the `jsURL` as that route is cached for 24 hours.
        // By design array.js, recorder.js, and toolbar.js are served from Django with no or limited caching, not from our CDN
        // Django respects the query params for caching, returning a 304 if appropriate
        var host = (params === null || params === void 0 ? void 0 : params['apiURL']) || this.instance.get_config('api_host');
        var timestampToNearestThirtySeconds = Math.floor(Date.now() / 30000) * 30000;
        var toolbarUrl = "".concat(host).concat(host.endsWith('/') ? '' : '/', "static/toolbar.js?_ts=").concat(timestampToNearestThirtySeconds);
        var disableToolbarMetrics = !POSTHOG_MANAGED_HOSTS.includes(this.instance.get_config('api_host')) &&
            this.instance.get_config('advanced_disable_toolbar_metrics');
        var toolbarParams = __assign(__assign({ apiURL: host, jsURL: host, token: this.instance.get_config('token') }, params), (disableToolbarMetrics ? { instrument: false } : {}));
        var _discard = toolbarParams.source, paramsToPersist = __rest(toolbarParams, ["source"]); // eslint-disable-line
        window.localStorage.setItem('_postHogToolbarParams', JSON.stringify(paramsToPersist));
        loadScript(toolbarUrl, function (err) {
            if (err) {
                logger.error('Failed to load toolbar', err);
                return;
            }
            ;
            (window['ph_load_toolbar'] || window['ph_load_editor'])(toolbarParams, _this.instance);
        });
        // Turbolinks doesn't fire an onload event but does replace the entire body, including the toolbar.
        // Thus, we ensure the toolbar is only loaded inside the body, and then reloaded on turbolinks:load.
        _register_event(window, 'turbolinks:load', function () {
            ;
            window['_postHogToolbarLoaded'] = false;
            _this.loadToolbar(toolbarParams);
        });
        return true;
    };
    /** @deprecated Use "loadToolbar" instead. */
    Toolbar.prototype._loadEditor = function (params) {
        return this.loadToolbar(params);
    };
    /** @deprecated Use "maybeLoadToolbar" instead. */
    Toolbar.prototype.maybeLoadEditor = function (location, localStorage, history) {
        if (location === void 0) { location = window.location; }
        if (localStorage === void 0) { localStorage = undefined; }
        if (history === void 0) { history = window.history; }
        return this.maybeLoadToolbar(location, localStorage, history);
    };
    return Toolbar;
}());
export { Toolbar };
//# sourceMappingURL=toolbar.js.map