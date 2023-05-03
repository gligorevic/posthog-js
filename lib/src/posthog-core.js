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
import { LZString } from './lz-string';
import Config from './config';
import { logger, document, userAgent, window, _isUndefined, _extend, _each, _isObject, _isBlockedUA, _copyAndTruncateStrings, _isArray, _safewrap_class, _register_event, _UUID, _info, _eachArray, } from './utils';
import { autocapture } from './autocapture';
import { PostHogPeople } from './posthog-people';
import { PostHogFeatureFlags } from './posthog-featureflags';
import { ALIAS_ID_KEY, PEOPLE_DISTINCT_ID_KEY, PostHogPersistence } from './posthog-persistence';
import { SessionRecording } from './extensions/sessionrecording';
import { WebPerformanceObserver } from './extensions/web-performance';
import { Decide } from './decide';
import { Toolbar } from './extensions/toolbar';
import { clearOptInOut, hasOptedIn, hasOptedOut, optIn, optOut, userOptedOut } from './gdpr-utils';
import { cookieStore, localStore } from './storage';
import { RequestQueue } from './request-queue';
import { CaptureMetrics } from './capture-metrics';
import { compressData, decideCompression } from './compression';
import { addParamsToURL, encodePostData, xhr } from './send-request';
import { RetryQueue } from './retry-queue';
import { SessionIdManager } from './sessionid';
import { SentryIntegration } from './extensions/sentry-integration';
import { createSegmentIntegration } from './extensions/segment-integration';
import { PageViewIdManager } from './page-view-id';
/*
SIMPLE STYLE GUIDE:

this.x === public function
this._x === internal - only use within this file
this.__x === private - only use within the class

Globals should be all caps
*/
var InitType;
(function (InitType) {
    InitType[InitType["INIT_MODULE"] = 0] = "INIT_MODULE";
    InitType[InitType["INIT_SNIPPET"] = 1] = "INIT_SNIPPET";
})(InitType || (InitType = {}));
var init_type;
// TODO: the type of this is very loose. Sometimes it's also PostHogLib itself
var posthog_master;
// some globals for comparisons
var __NOOP = function () { };
var __NOOPTIONS = {};
var PRIMARY_INSTANCE_NAME = 'posthog';
/*
 * Dynamic... constants? Is that an oxymoron?
 */
// http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
var USE_XHR = window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest();
// IE<10 does not support cross-origin XHR's but script tags
// with defer won't block window.onload; ENQUEUE_REQUESTS
// should only be true for Opera<12
var ENQUEUE_REQUESTS = !USE_XHR && userAgent.indexOf('MSIE') === -1 && userAgent.indexOf('Mozilla') === -1;
var defaultConfig = function () {
    var _a, _b, _c;
    return ({
        api_host: 'https://app.posthog.com',
        api_method: 'POST',
        api_transport: 'XHR',
        ui_host: null,
        token: '',
        autocapture: true,
        rageclick: true,
        cross_subdomain_cookie: ((_b = (_a = document === null || document === void 0 ? void 0 : document.location) === null || _a === void 0 ? void 0 : _a.hostname) === null || _b === void 0 ? void 0 : _b.indexOf('herokuapp.com')) === -1,
        persistence: 'cookie',
        persistence_name: '',
        cookie_name: '',
        loaded: __NOOP,
        store_google: true,
        custom_campaign_params: [],
        save_referrer: true,
        test: false,
        verbose: false,
        img: false,
        capture_pageview: true,
        capture_pageleave: true,
        debug: false,
        cookie_expiration: 365,
        upgrade: false,
        disable_session_recording: false,
        disable_persistence: false,
        disable_cookie: false,
        enable_recording_console_log: undefined,
        secure_cookie: ((_c = window === null || window === void 0 ? void 0 : window.location) === null || _c === void 0 ? void 0 : _c.protocol) === 'https:',
        ip: true,
        opt_out_capturing_by_default: false,
        opt_out_persistence_by_default: false,
        opt_out_capturing_persistence_type: 'localStorage',
        opt_out_capturing_cookie_prefix: null,
        opt_in_site_apps: false,
        property_blacklist: [],
        respect_dnt: false,
        sanitize_properties: null,
        xhr_headers: {},
        inapp_protocol: '//',
        inapp_link_new_window: false,
        request_batching: true,
        properties_string_max_length: 65535,
        session_recording: {
            // select set of rrweb config options we expose to our users
            // see https://github.com/rrweb-io/rrweb/blob/master/guide.md
            blockClass: 'ph-no-capture',
            blockSelector: null,
            ignoreClass: 'ph-ignore-input',
            maskAllInputs: true,
            maskInputOptions: {},
            maskInputFn: null,
            slimDOMOptions: {},
            collectFonts: false,
            inlineStylesheet: true,
        },
        mask_all_element_attributes: false,
        mask_all_text: false,
        advanced_disable_decide: false,
        advanced_disable_toolbar_metrics: false,
        on_xhr_error: function (req) {
            var error = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
            console.error(error);
        },
        get_device_id: function (uuid) { return uuid; },
        // Used for internal testing
        _onCapture: __NOOP,
        _capture_metrics: false,
        capture_performance: undefined,
        name: 'posthog',
        callback_fn: 'posthog._jsc',
        bootstrap: {},
        disable_compression: false,
    });
};
/**
 * create_phlib(token:string, config:object, name:string)
 *
 * This function is used by the init method of PostHogLib objects
 * as well as the main initializer at the end of the JSLib (that
 * initializes document.posthog as well as any additional instances
 * declared before this file has loaded).
 */
var create_phlib = function (token, config, name, createComplete) {
    var instance;
    var target = name === PRIMARY_INSTANCE_NAME || !posthog_master ? posthog_master : name ? posthog_master[name] : undefined;
    var callbacksHandled = {
        initComplete: false,
        syncCode: false,
    };
    var handleCallback = function (callbackName) { return function (instance) {
        if (!callbacksHandled[callbackName]) {
            callbacksHandled[callbackName] = true;
            if (callbacksHandled.initComplete && callbacksHandled.syncCode) {
                createComplete === null || createComplete === void 0 ? void 0 : createComplete(instance);
            }
        }
    }; };
    if (target && init_type === InitType.INIT_MODULE) {
        instance = target;
    }
    else {
        if (target && !_isArray(target)) {
            console.error('You have already initialized ' + name);
            // TODO: throw something instead?
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return;
        }
        instance = new PostHog();
    }
    instance._init(token, config, name, handleCallback('initComplete'));
    instance.toolbar.maybeLoadToolbar();
    instance.sessionRecording = new SessionRecording(instance);
    instance.sessionRecording.startRecordingIfEnabled();
    instance.webPerformance = new WebPerformanceObserver(instance);
    instance.webPerformance.startObservingIfEnabled();
    instance.__autocapture = instance.get_config('autocapture');
    autocapture._setIsAutocaptureEnabled(instance);
    if (autocapture._isAutocaptureEnabled) {
        instance.__autocapture = instance.get_config('autocapture');
        var num_buckets = 100;
        var num_enabled_buckets = 100;
        if (!autocapture.enabledForProject(instance.get_config('token'), num_buckets, num_enabled_buckets)) {
            instance.__autocapture = false;
            logger.log('Not in active bucket: disabling Automatic Event Collection.');
        }
        else if (!autocapture.isBrowserSupported()) {
            instance.__autocapture = false;
            logger.log('Disabling Automatic Event Collection because this browser is not supported');
        }
        else {
            autocapture.init(instance);
        }
    }
    // if any instance on the page has debug = true, we set the
    // global debug to be true
    Config.DEBUG = Config.DEBUG || instance.get_config('debug');
    // if target is not defined, we called init after the lib already
    // loaded, so there won't be an array of things to execute
    if (typeof target !== 'undefined' && _isArray(target)) {
        // Crunch through the people queue first - we queue this data up &
        // flush on identify, so it's better to do all these operations first
        instance._execute_array.call(instance.people, target.people);
        instance._execute_array(target);
    }
    handleCallback('syncCode')(instance);
    return instance;
};
/**
 * PostHog Library Object
 * @constructor
 */
var PostHog = /** @class */ (function () {
    function PostHog() {
        var _this = this;
        this.config = defaultConfig();
        this.compression = {};
        this.decideEndpointWasHit = false;
        this.SentryIntegration = SentryIntegration;
        this.segmentIntegration = function () { return createSegmentIntegration(_this); };
        this.__captureHooks = [];
        this.__request_queue = [];
        this.__loaded = false;
        this.__loaded_recorder_version = undefined;
        this.__autocapture = undefined;
        this._jsc = function () { };
        this.people = new PostHogPeople(this);
        this.featureFlags = new PostHogFeatureFlags(this);
        this.feature_flags = this.featureFlags;
        this.toolbar = new Toolbar(this);
        this.pageViewIdManager = new PageViewIdManager();
        // these are created in _init() after we have the config
        this._captureMetrics = undefined;
        this._requestQueue = undefined;
        this._retryQueue = undefined;
        this.persistence = undefined;
        this.sessionPersistence = undefined;
        this.sessionManager = undefined;
    }
    // Initialization methods
    /**
     * This function initializes a new instance of the PostHog capturing object.
     * All new instances are added to the main posthog object as sub properties (such as
     * posthog.library_name) and also returned by this function. To define a
     * second instance on the page, you would call:
     *
     *     posthog.init('new token', { your: 'config' }, 'library_name');
     *
     * and use it like so:
     *
     *     posthog.library_name.capture(...);
     *
     * @param {String} token   Your PostHog API token
     * @param {Object} [config]  A dictionary of config options to override. <a href="https://github.com/posthog/posthog-js/blob/6e0e873/src/posthog-core.js#L57-L91">See a list of default config options</a>.
     * @param {String} [name]    The name for the new posthog instance that you want created
     */
    PostHog.prototype.init = function (token, config, name) {
        if (_isUndefined(name)) {
            console.error('You must name your new library: init(token, config, name)');
            return;
        }
        if (name === PRIMARY_INSTANCE_NAME) {
            console.error('You must initialize the main posthog object right after you include the PostHog js snippet');
            return;
        }
        var instance = create_phlib(token, config, name, function (instance) {
            posthog_master[name] = instance;
            instance._loaded();
        });
        posthog_master[name] = instance;
        return instance;
    };
    // posthog._init(token:string, config:object, name:string)
    //
    // This function sets up the current instance of the posthog
    // library.  The difference between this method and the init(...)
    // method is this one initializes the actual instance, whereas the
    // init(...) method sets up a new library and calls _init on it.
    //
    // Note that there are operations that can be asynchronous, so we
    // accept a callback that is called when all the asynchronous work
    // is done. Note that we do not use promises because we want to be
    // IE11 compatible. We could use polyfills, which would make the
    // code a bit cleaner, but will add some overhead.
    //
    PostHog.prototype._init = function (token, config, name, initComplete) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        if (config === void 0) { config = {}; }
        this.__loaded = true;
        this.config = {}; // will be set right below
        this._triggered_notifs = [];
        // To avoid using Promises and their helper functions, we instead keep
        // track of which callbacks have been called, and then call initComplete
        // when all of them have been called. To add additional async code, add
        // to `callbacksHandled` and pass updateInitComplete as a callback to
        // the async code.
        var callbacksHandled = { segmentRegister: false, syncCode: false };
        var updateInitComplete = function (callbackName) { return function () {
            // Update the register of callbacks that have been called, and if
            // they have all been called, then we are ready to call
            // initComplete.
            if (!callbacksHandled[callbackName]) {
                callbacksHandled[callbackName] = true;
                if (callbacksHandled.segmentRegister && callbacksHandled.syncCode) {
                    initComplete === null || initComplete === void 0 ? void 0 : initComplete(_this);
                }
            }
        }; };
        this.set_config(_extend({}, defaultConfig(), config, {
            name: name,
            token: token,
            callback_fn: (name === PRIMARY_INSTANCE_NAME ? name : PRIMARY_INSTANCE_NAME + '.' + name) + '._jsc',
        }));
        this._jsc = function () { };
        // Check if recorder.js is already loaded
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (((_a = window === null || window === void 0 ? void 0 : window.rrweb) === null || _a === void 0 ? void 0 : _a.record) || (window === null || window === void 0 ? void 0 : window.rrwebRecord)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.__loaded_recorder_version = (_b = window === null || window === void 0 ? void 0 : window.rrweb) === null || _b === void 0 ? void 0 : _b.version;
        }
        this._captureMetrics = new CaptureMetrics(this.get_config('_capture_metrics'));
        this._requestQueue = new RequestQueue(this._captureMetrics, this._handle_queued_event.bind(this));
        this._retryQueue = new RetryQueue(this._captureMetrics, this.get_config('on_xhr_error'));
        this.__captureHooks = [];
        this.__request_queue = [];
        this.persistence = new PostHogPersistence(this.config);
        this.sessionManager = new SessionIdManager(this.config, this.persistence);
        this.sessionPersistence =
            this.config.persistence === 'sessionStorage'
                ? this.persistence
                : new PostHogPersistence(__assign(__assign({}, this.config), { persistence: 'sessionStorage' }));
        this._gdpr_init();
        if (config.segment) {
            // Use segments anonymousId instead
            this.config.get_device_id = function () { return config.segment.user().anonymousId(); };
            // If a segment user ID exists, set it as the distinct_id
            if (config.segment.user().id()) {
                this.register({
                    distinct_id: config.segment.user().id(),
                });
                this.persistence.set_user_state('identified');
            }
            config.segment.register(this.segmentIntegration()).then(updateInitComplete('segmentRegister'));
        }
        else {
            updateInitComplete('segmentRegister')();
        }
        if (((_c = config.bootstrap) === null || _c === void 0 ? void 0 : _c.distinctID) !== undefined) {
            var uuid = this.get_config('get_device_id')(_UUID());
            var deviceID = ((_d = config.bootstrap) === null || _d === void 0 ? void 0 : _d.isIdentifiedID) ? uuid : config.bootstrap.distinctID;
            this.persistence.set_user_state(((_e = config.bootstrap) === null || _e === void 0 ? void 0 : _e.isIdentifiedID) ? 'identified' : 'anonymous');
            this.register({
                distinct_id: config.bootstrap.distinctID,
                $device_id: deviceID,
            });
        }
        if (this._hasBootstrappedFeatureFlags()) {
            var activeFlags_1 = Object.keys(((_f = config.bootstrap) === null || _f === void 0 ? void 0 : _f.featureFlags) || {})
                .filter(function (flag) { var _a, _b; return !!((_b = (_a = config.bootstrap) === null || _a === void 0 ? void 0 : _a.featureFlags) === null || _b === void 0 ? void 0 : _b[flag]); })
                .reduce(function (res, key) {
                var _a, _b;
                return ((res[key] = ((_b = (_a = config.bootstrap) === null || _a === void 0 ? void 0 : _a.featureFlags) === null || _b === void 0 ? void 0 : _b[key]) || false), res);
            }, {});
            var featureFlagPayloads = Object.keys(((_g = config.bootstrap) === null || _g === void 0 ? void 0 : _g.featureFlagPayloads) || {})
                .filter(function (key) { return activeFlags_1[key]; })
                .reduce(function (res, key) {
                var _a, _b, _c, _d;
                if ((_b = (_a = config.bootstrap) === null || _a === void 0 ? void 0 : _a.featureFlagPayloads) === null || _b === void 0 ? void 0 : _b[key]) {
                    res[key] = (_d = (_c = config.bootstrap) === null || _c === void 0 ? void 0 : _c.featureFlagPayloads) === null || _d === void 0 ? void 0 : _d[key];
                }
                return res;
            }, {});
            this.featureFlags.receivedFeatureFlags({ featureFlags: activeFlags_1, featureFlagPayloads: featureFlagPayloads });
        }
        if (!this.get_distinct_id()) {
            // There is no need to set the distinct id
            // or the device id if something was already stored
            // in the persitence
            var uuid = this.get_config('get_device_id')(_UUID());
            this.register_once({
                distinct_id: uuid,
                $device_id: uuid,
            }, '');
            // distinct id == $device_id is a proxy for anonymous user
            this.persistence.set_user_state('anonymous');
        }
        // Set up event handler for pageleave
        // Use `onpagehide` if available, see https://calendar.perfplanet.com/2020/beaconing-in-practice/#beaconing-reliability-avoiding-abandons
        typeof window !== undefined && window.addEventListener &&
            window.addEventListener('onpagehide' in self ? 'pagehide' : 'unload', this._handle_unload.bind(this));
        // Make sure that we also call the initComplete callback at the end of
        // the synchronous code as well.
        updateInitComplete('syncCode')();
    };
    // Private methods
    PostHog.prototype._loaded = function () {
        // Pause `reloadFeatureFlags` calls in config.loaded callback.
        // These feature flags are loaded in the decide call made right
        // afterwards
        this.featureFlags.setReloadingPaused(true);
        try {
            this.get_config('loaded')(this);
        }
        catch (err) {
            console.error('`loaded` function failed', err);
        }
        this._start_queue_if_opted_in();
        // this happens after so a user can call identify in
        // the loaded callback
        if (this.get_config('capture_pageview')) {
            this.capture('$pageview', {}, { send_instantly: true });
        }
        // Call decide to get what features are enabled and other settings.
        // As a reminder, if the /decide endpoint is disabled, feature flags, toolbar, session recording, autocapture,
        // and compression will not be available.
        if (!this.get_config('advanced_disable_decide')) {
            new Decide(this).call();
        }
        this.featureFlags.resetRequestQueue();
        this.featureFlags.setReloadingPaused(false);
    };
    PostHog.prototype._start_queue_if_opted_in = function () {
        if (!this.has_opted_out_capturing()) {
            if (this.get_config('request_batching')) {
                this._requestQueue.poll();
            }
        }
    };
    PostHog.prototype._dom_loaded = function () {
        var _this = this;
        if (!this.has_opted_out_capturing()) {
            _eachArray(this.__request_queue, function (item) {
                _this._send_request.apply(_this, __spreadArray([], __read(item), false));
            });
        }
        this.__request_queue = [];
        this._start_queue_if_opted_in();
    };
    /**
     * _prepare_callback() should be called by callers of _send_request for use
     * as the callback argument.
     *
     * If there is no callback, this returns null.
     * If we are going to make XHR/XDR requests, this returns a function.
     * If we are going to use script tags, this returns a string to use as the
     * callback GET param.
     */
    // TODO: get rid of the "| string"
    PostHog.prototype._prepare_callback = function (callback, data) {
        if (_isUndefined(callback)) {
            return null;
        }
        if (USE_XHR) {
            return function (response) {
                callback(response, data);
            };
        }
        else {
            // if the user gives us a callback, we store as a random
            // property on this instances jsc function and update our
            // callback string to reflect that.
            var jsc_1 = this._jsc;
            var randomized_cb_1 = '' + Math.floor(Math.random() * 100000000);
            var callback_string = this.get_config('callback_fn') + '[' + randomized_cb_1 + ']';
            jsc_1[randomized_cb_1] = function (response) {
                delete jsc_1[randomized_cb_1];
                callback(response, data);
            };
            return callback_string;
        }
    };
    PostHog.prototype._handle_unload = function () {
        if (!this.get_config('request_batching')) {
            if (this.get_config('capture_pageview') && this.get_config('capture_pageleave')) {
                this.capture('$pageleave', null, { transport: 'sendBeacon' });
            }
            return;
        }
        if (this.get_config('capture_pageview') && this.get_config('capture_pageleave')) {
            this.capture('$pageleave');
        }
        if (this.get_config('_capture_metrics')) {
            this._requestQueue.updateUnloadMetrics();
            this.capture('$capture_metrics', this._captureMetrics.metrics);
        }
        this._requestQueue.unload();
        this._retryQueue.unload();
    };
    PostHog.prototype._handle_queued_event = function (url, data, options) {
        var jsonData = JSON.stringify(data);
        this.__compress_and_send_json_request(url, jsonData, options || __NOOPTIONS, __NOOP);
    };
    PostHog.prototype.__compress_and_send_json_request = function (url, jsonData, options, callback) {
        var _a = __read(compressData(decideCompression(this.compression), jsonData, options), 2), data = _a[0], _options = _a[1];
        this._send_request(url, data, _options, callback);
    };
    PostHog.prototype._send_request = function (url, data, options, callback) {
        var _a;
        if (ENQUEUE_REQUESTS) {
            this.__request_queue.push([url, data, options, callback]);
            return;
        }
        var DEFAULT_OPTIONS = {
            method: this.get_config('api_method'),
            transport: this.get_config('api_transport'),
            verbose: this.get_config('verbose'),
        };
        options = _extend(DEFAULT_OPTIONS, options || {});
        if (!USE_XHR) {
            options.method = 'GET';
        }
        var useSendBeacon = 'sendBeacon' in window.navigator && options.transport === 'sendBeacon';
        url = addParamsToURL(url, options.urlQueryArgs || {}, {
            ip: this.get_config('ip'),
        });
        if (_isObject(data) && this.get_config('img')) {
            var img = document.createElement('img');
            img.src = url;
            document.body.appendChild(img);
        }
        else if (useSendBeacon) {
            // beacon documentation https://w3c.github.io/beacon/
            // beacons format the message and use the type property
            // also no need to try catch as sendBeacon does not report errors
            //   and is defined as best effort attempt
            try {
                window.navigator.sendBeacon(url, encodePostData(data, __assign(__assign({}, options), { sendBeacon: true })));
            }
            catch (e) {
                if (this.get_config('debug')) {
                    console.error(e);
                }
            }
        }
        else if (USE_XHR) {
            try {
                xhr({
                    url: url,
                    data: data,
                    headers: this.get_config('xhr_headers'),
                    options: options,
                    captureMetrics: this._captureMetrics,
                    callback: callback,
                    retriesPerformedSoFar: 0,
                    retryQueue: this._retryQueue,
                    onXHRError: this.get_config('on_xhr_error'),
                });
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = url;
            var s = document.getElementsByTagName('script')[0];
            (_a = s.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(script, s);
        }
    };
    /**
     * _execute_array() deals with processing any posthog function
     * calls that were called before the PostHog library were loaded
     * (and are thus stored in an array so they can be called later)
     *
     * Note: we fire off all the posthog function calls && user defined
     * functions BEFORE we fire off posthog capturing calls. This is so
     * identify/register/set_config calls can properly modify early
     * capturing calls.
     *
     * @param {Array} array
     */
    PostHog.prototype._execute_array = function (array) {
        var _this = this;
        var fn_name;
        var alias_calls = [];
        var other_calls = [];
        var capturing_calls = [];
        _eachArray(array, function (item) {
            if (item) {
                fn_name = item[0];
                if (_isArray(fn_name)) {
                    capturing_calls.push(item); // chained call e.g. posthog.get_group().set()
                }
                else if (typeof item === 'function') {
                    ;
                    item.call(_this);
                }
                else if (_isArray(item) && fn_name === 'alias') {
                    alias_calls.push(item);
                }
                else if (_isArray(item) &&
                    fn_name.indexOf('capture') !== -1 &&
                    typeof _this[fn_name] === 'function') {
                    capturing_calls.push(item);
                }
                else {
                    other_calls.push(item);
                }
            }
        });
        var execute = function (calls, thisArg) {
            _eachArray(calls, function (item) {
                if (_isArray(item[0])) {
                    // chained call
                    var caller_1 = thisArg;
                    _each(item, function (call) {
                        caller_1 = caller_1[call[0]].apply(caller_1, call.slice(1));
                    });
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this[item[0]].apply(this, item.slice(1));
                }
            }, thisArg);
        };
        execute(alias_calls, this);
        execute(other_calls, this);
        execute(capturing_calls, this);
    };
    PostHog.prototype._hasBootstrappedFeatureFlags = function () {
        var _a, _b;
        return ((((_a = this.config.bootstrap) === null || _a === void 0 ? void 0 : _a.featureFlags) && Object.keys((_b = this.config.bootstrap) === null || _b === void 0 ? void 0 : _b.featureFlags).length > 0) ||
            false);
    };
    /**
     * push() keeps the standard async-array-push
     * behavior around after the lib is loaded.
     * This is only useful for external integrations that
     * do not wish to rely on our convenience methods
     * (created in the snippet).
     *
     * ### Usage:
     *     posthog.push(['register', { a: 'b' }]);
     *
     * @param {Array} item A [function_name, args...] array to be executed
     */
    PostHog.prototype.push = function (item) {
        this._execute_array([item]);
    };
    /**
     * Capture an event. This is the most important and
     * frequently used PostHog function.
     *
     * ### Usage:
     *
     *     // capture an event named 'Registered'
     *     posthog.capture('Registered', {'Gender': 'Male', 'Age': 21});
     *
     *     // capture an event using navigator.sendBeacon
     *     posthog.capture('Left page', {'duration_seconds': 35}, {transport: 'sendBeacon'});
     *
     * @param {String} event_name The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
     * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
     * @param {Object} [options] Optional configuration for this capture request.
     * @param {String} [options.transport] Transport method for network request ('XHR' or 'sendBeacon').
     * @param {Date} [options.timestamp] Timestamp is a Date object. If not set, it'll automatically be set to the current time.
     */
    PostHog.prototype.capture = function (event_name, properties, options) {
        if (options === void 0) { options = __NOOPTIONS; }
        // While developing, a developer might purposefully _not_ call init(),
        // in this case, we would like capture to be a noop.
        if (!this.__loaded) {
            return;
        }
        if (userOptedOut(this, false)) {
            return;
        }
        this._captureMetrics.incr('capture');
        if (event_name === '$snapshot') {
            this._captureMetrics.incr('snapshot');
        }
        options = options || __NOOPTIONS;
        var transport = options['transport']; // external API, don't minify 'transport' prop
        if (transport) {
            options.transport = transport; // 'transport' prop name can be minified internally
        }
        // typing doesn't prevent interesting data
        if (_isUndefined(event_name) || typeof event_name !== 'string') {
            console.error('No event name provided to posthog.capture');
            return;
        }
        if (_isBlockedUA(userAgent)) {
            return;
        }
        // update persistence
        this.sessionPersistence.update_search_keyword();
        if (this.get_config('store_google')) {
            this.sessionPersistence.update_campaign_params();
        }
        if (this.get_config('save_referrer')) {
            this.sessionPersistence.update_referrer_info();
        }
        var data = {
            event: event_name,
            properties: this._calculate_event_properties(event_name, properties || {}),
        };
        if (event_name === '$identify' && options.$set) {
            data['$set'] = options['$set'];
        }
        data = _copyAndTruncateStrings(data, options._noTruncate ? null : this.get_config('properties_string_max_length'));
        data.timestamp = options.timestamp || new Date();
        if (this.get_config('debug')) {
            logger.log('PostHog.js send', data);
        }
        var jsonData = JSON.stringify(data);
        var url = this.get_config('api_host') + (options.endpoint || '/e/');
        var has_unique_traits = options !== __NOOPTIONS;
        if (this.get_config('request_batching') &&
            (!has_unique_traits || options._batchKey) &&
            !options.send_instantly) {
            this._requestQueue.enqueue(url, data, options);
        }
        else {
            this.__compress_and_send_json_request(url, jsonData, options);
        }
        this._invokeCaptureHooks(event_name, data);
        return data;
    };
    PostHog.prototype._addCaptureHook = function (callback) {
        this.__captureHooks.push(callback);
    };
    PostHog.prototype._invokeCaptureHooks = function (eventName, eventData) {
        this.config._onCapture(eventName, eventData);
        _each(this.__captureHooks, function (callback) { return callback(eventName); });
    };
    PostHog.prototype._calculate_event_properties = function (event_name, event_properties) {
        var _a;
        // set defaults
        var start_timestamp = this.persistence.remove_event_timer(event_name);
        var properties = __assign({}, event_properties);
        properties['token'] = this.get_config('token');
        if (event_name === '$snapshot') {
            var persistenceProps = __assign(__assign({}, this.persistence.properties()), this.sessionPersistence.properties());
            properties['distinct_id'] = persistenceProps.distinct_id;
            return properties;
        }
        var infoProperties = _info.properties();
        if (this.sessionManager) {
            var _b = this.sessionManager.checkAndGetSessionAndWindowId(), sessionId = _b.sessionId, windowId = _b.windowId;
            properties['$session_id'] = sessionId;
            properties['$window_id'] = windowId;
        }
        if ((_a = this.webPerformance) === null || _a === void 0 ? void 0 : _a.isEnabled) {
            if (event_name === '$pageview') {
                this.pageViewIdManager.onPageview();
            }
            properties = _extend(properties, { $pageview_id: this.pageViewIdManager.getPageViewId() });
        }
        if (event_name === '$performance_event') {
            var persistenceProps = this.persistence.properties();
            // Early exit for $performance_event as we only need session and $current_url
            properties['distinct_id'] = persistenceProps.distinct_id;
            properties['$current_url'] = infoProperties.$current_url;
            return properties;
        }
        // set $duration if time_event was previously called for this event
        if (typeof start_timestamp !== 'undefined') {
            var duration_in_ms = new Date().getTime() - start_timestamp;
            properties['$duration'] = parseFloat((duration_in_ms / 1000).toFixed(3));
        }
        // note: extend writes to the first object, so lets make sure we
        // don't write to the persistence properties object and info
        // properties object by passing in a new object
        // update properties with pageview info and super-properties
        properties = _extend({}, _info.properties(), this.persistence.properties(), this.sessionPersistence.properties(), properties);
        var property_blacklist = this.get_config('property_blacklist');
        if (_isArray(property_blacklist)) {
            _each(property_blacklist, function (blacklisted_prop) {
                delete properties[blacklisted_prop];
            });
        }
        else {
            console.error('Invalid value for property_blacklist config: ' + property_blacklist);
        }
        var sanitize_properties = this.get_config('sanitize_properties');
        if (sanitize_properties) {
            properties = sanitize_properties(properties, event_name);
        }
        return properties;
    };
    /**
     * Register a set of super properties, which are included with all
     * events. This will overwrite previous super property values, except
     * for session properties (see `register_for_session(properties)`).
     *
     * ### Usage:
     *
     *     // register 'Gender' as a super property
     *     posthog.register({'Gender': 'Female'});
     *
     *     // register several super properties when a user signs up
     *     posthog.register({
     *         'Email': 'jdoe@example.com',
     *         'Account Type': 'Free'
     *     });
     *
     *     // Display the properties
     *     console.log(posthog.persistence.properties())
     *
     * @param {Object} properties An associative array of properties to store about the user
     * @param {Number} [days] How many days since the user's last visit to store the super properties
     */
    PostHog.prototype.register = function (properties, days) {
        this.persistence.register(properties, days);
    };
    /**
     * Register a set of super properties only once. These will not
     * overwrite previous super property values, unlike register().
     *
     * ### Usage:
     *
     *     // register a super property for the first time only
     *     posthog.register_once({
     *         'First Login Date': new Date().toISOString()
     *     });
     *
     *     // Display the properties
     *     console.log(posthog.persistence.properties())
     *
     * ### Notes:
     *
     * If default_value is specified, current super properties
     * with that value will be overwritten.
     *
     * @param {Object} properties An associative array of properties to store about the user
     * @param {*} [default_value] Value to override if already set in super properties (ex: 'False') Default: 'None'
     * @param {Number} [days] How many days since the users last visit to store the super properties
     */
    PostHog.prototype.register_once = function (properties, default_value, days) {
        this.persistence.register_once(properties, default_value, days);
    };
    /**
     * Register a set of super properties, which are included with all events, but only
     * for THIS SESSION. These will overwrite all other super property values.
     *
     * Unlike regular super properties, which last in LocalStorage for a long time,
     * session super properties get cleared after a session ends.
     *
     * ### Usage:
     *
     *     // register on all events this session
     *     posthog.register_for_session({'referer': customGetReferer()});
     *
     *     // register several session super properties when a user signs up
     *     posthog.register_for_session({
     *         'selectedPlan': 'pro',
     *         'completedSteps': 4,
     *     });
     *
     *     // Display the properties
     *     console.log(posthog.sessionPersistence.properties())
     *
     * @param {Object} properties An associative array of properties to store about the user
     */
    PostHog.prototype.register_for_session = function (properties) {
        this.sessionPersistence.register(properties);
    };
    /**
     * Delete a super property stored with the current user.
     *
     * @param {String} property The name of the super property to remove
     */
    PostHog.prototype.unregister = function (property) {
        this.persistence.unregister(property);
    };
    /**
     * Delete a session super property stored with the current user.
     *
     * @param {String} property The name of the session super property to remove
     */
    PostHog.prototype.unregister_for_session = function (property) {
        this.sessionPersistence.unregister(property);
    };
    PostHog.prototype._register_single = function (prop, value) {
        var _a;
        this.register((_a = {}, _a[prop] = value, _a));
    };
    /*
     * Get feature flag value for user (supports multivariate flags).
     *
     * ### Usage:
     *
     *     if(posthog.getFeatureFlag('beta-feature') === 'some-value') { // do something }
     *
     * @param {Object|String} prop Key of the feature flag.
     * @param {Object|String} options (optional) If {send_event: false}, we won't send an $feature_flag_call event to PostHog.
     */
    PostHog.prototype.getFeatureFlag = function (key, options) {
        return this.featureFlags.getFeatureFlag(key, options);
    };
    /*
     * Get feature flag payload value matching key for user (supports multivariate flags).
     *
     * ### Usage:
     *
     *     if(posthog.getFeatureFlag('beta-feature') === 'some-value') {
     *          const someValue = posthog.getFeatureFlagPayload('beta-feature')
     *          // do something
     *     }
     *
     * @param {Object|String} prop Key of the feature flag.
     */
    PostHog.prototype.getFeatureFlagPayload = function (key) {
        var payload = this.featureFlags.getFeatureFlagPayload(key);
        try {
            return JSON.parse(payload);
        }
        catch (_a) {
            return payload;
        }
    };
    /*
     * See if feature flag is enabled for user.
     *
     * ### Usage:
     *
     *     if(posthog.isFeatureEnabled('beta-feature')) { // do something }
     *
     * @param {Object|String} prop Key of the feature flag.
     * @param {Object|String} options (optional) If {send_event: false}, we won't send an $feature_flag_call event to PostHog.
     */
    PostHog.prototype.isFeatureEnabled = function (key, options) {
        return this.featureFlags.isFeatureEnabled(key, options);
    };
    PostHog.prototype.reloadFeatureFlags = function () {
        this.featureFlags.reloadFeatureFlags();
    };
    /** Opt the user in or out of an early access feature. */
    PostHog.prototype.updateEarlyAccessFeatureEnrollment = function (key, isEnrolled) {
        this.featureFlags.updateEarlyAccessFeatureEnrollment(key, isEnrolled);
    };
    /** Get the list of early access features. To check enrollment status, use `isFeatureEnabled`. */
    PostHog.prototype.getEarlyAccessFeatures = function (callback, force_reload) {
        if (force_reload === void 0) { force_reload = false; }
        return this.featureFlags.getEarlyAccessFeatures(callback, force_reload);
    };
    /*
     * Register an event listener that runs when feature flags become available or when they change.
     * If there are flags, the listener is called immediately in addition to being called on future changes.
     *
     * ### Usage:
     *
     *     posthog.onFeatureFlags(function(featureFlags) { // do something })
     *
     * @param {Function} [callback] The callback function will be called once the feature flags are ready or when they are updated.
     *                              It'll return a list of feature flags enabled for the user.
     * @returns {Function} A function that can be called to unsubscribe the listener. Used by useEffect when the component unmounts.
     */
    PostHog.prototype.onFeatureFlags = function (callback) {
        return this.featureFlags.onFeatureFlags(callback);
    };
    /**
     * Identify a user with a unique ID instead of a PostHog
     * randomly generated distinct_id. If the method is never called,
     * then unique visitors will be identified by a UUID that is generated
     * the first time they visit the site.
     *
     * If user properties are passed, they are also sent to posthog.
     *
     * ### Usage:
     *
     *      posthog.identify('[user unique id]')
     *      posthog.identify('[user unique id]', { email: 'john@example.com' })
     *      posthog.identify('[user unique id]', {}, { referral_code: '12345' })
     *
     * ### Notes:
     *
     * You can call this function to overwrite a previously set
     * unique ID for the current user.
     *
     * If the user has been identified ($user_state in persistence is set to 'identified'),
     * then capture of $identify is skipped to avoid merging users. For example,
     * if your system allows an admin user to impersonate another user.
     *
     * Then a single browser instance can have:
     *
     *  `identify('a') -> capture(1) -> identify('b') -> capture(2)`
     *
     * and capture 1 and capture 2 will have the correct distinct_id.
     * but users a and b will NOT be merged in posthog.
     *
     * However, if reset is called then:
     *
     *  `identify('a') -> capture(1) -> reset() -> capture(2) -> identify('b') -> capture(3)`
     *
     * users a and b are not merged.
     * Capture 1 is associated with user a.
     * A new distinct id is generated for capture 2.
     * which is merged with user b.
     * So, capture 2 and 3 are associated with user b.
     *
     * If you want to merge two identified users, you can call posthog.alias
     *
     * @param {String} [new_distinct_id] A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used.
     * @param {Object} [userPropertiesToSet] Optional: An associative array of properties to store about the user
     * @param {Object} [userPropertiesToSetOnce] Optional: An associative array of properties to store about the user. If property is previously set, this does not override that value.
     */
    PostHog.prototype.identify = function (new_distinct_id, userPropertiesToSet, userPropertiesToSetOnce) {
        //if the new_distinct_id has not been set ignore the identify event
        if (!new_distinct_id) {
            console.error('Unique user id has not been set in posthog.identify');
            return;
        }
        this._captureMetrics.incr('identify');
        var previous_distinct_id = this.get_distinct_id();
        this.register({ $user_id: new_distinct_id });
        if (!this.get_property('$device_id')) {
            // The persisted distinct id might not actually be a device id at all
            // it might be a distinct id of the user from before
            var device_id = previous_distinct_id;
            this.register_once({
                $had_persisted_distinct_id: true,
                $device_id: device_id,
            }, '');
        }
        // if the previous distinct id had an alias stored, then we clear it
        if (new_distinct_id !== previous_distinct_id && new_distinct_id !== this.get_property(ALIAS_ID_KEY)) {
            this.unregister(ALIAS_ID_KEY);
            this.register({ distinct_id: new_distinct_id });
        }
        var isKnownAnonymous = this.persistence.get_user_state() === 'anonymous';
        // send an $identify event any time the distinct_id is changing and the old ID is an anoymous ID
        // - logic on the server will determine whether or not to do anything with it.
        if (new_distinct_id !== previous_distinct_id && isKnownAnonymous) {
            this.persistence.set_user_state('identified');
            this.capture('$identify', {
                distinct_id: new_distinct_id,
                $anon_distinct_id: previous_distinct_id,
            }, { $set: userPropertiesToSet || {}, $set_once: userPropertiesToSetOnce || {} });
            // let the reload feature flag request know to send this previous distinct id
            // for flag consistency
            this.featureFlags.setAnonymousDistinctId(previous_distinct_id);
        }
        else {
            if (userPropertiesToSet) {
                this.people.set(userPropertiesToSet);
            }
            if (userPropertiesToSetOnce) {
                this.people.set_once(userPropertiesToSetOnce);
            }
        }
        // Reload active feature flags if the user identity changes.
        // Note we don't reload this on property changes as these get processed async
        if (new_distinct_id !== previous_distinct_id) {
            this.reloadFeatureFlags();
        }
    };
    /**
     * Alpha feature: don't use unless you know what you're doing!
     *
     * Sets group analytics information for subsequent events and reloads feature flags.
     *
     * @param {String} groupType Group type (example: 'organization')
     * @param {String} groupKey Group key (example: 'org::5')
     * @param {Object} groupPropertiesToSet Optional properties to set for group
     */
    PostHog.prototype.group = function (groupType, groupKey, groupPropertiesToSet) {
        var _a, _b;
        if (!groupType || !groupKey) {
            console.error('posthog.group requires a group type and group key');
            return;
        }
        this._captureMetrics.incr('group');
        var existingGroups = this.getGroups();
        // if group key changes, remove stored group properties
        if (existingGroups[groupType] !== groupKey) {
            this.resetGroupPropertiesForFlags(groupType);
        }
        this.register({ $groups: __assign(__assign({}, existingGroups), (_a = {}, _a[groupType] = groupKey, _a)) });
        if (groupPropertiesToSet) {
            this.capture('$groupidentify', {
                $group_type: groupType,
                $group_key: groupKey,
                $group_set: groupPropertiesToSet,
            });
            this.setGroupPropertiesForFlags((_b = {}, _b[groupType] = groupPropertiesToSet, _b));
        }
        // If groups change and no properties change, reload feature flags.
        // The property change reload case is handled in setGroupPropertiesForFlags.
        if (existingGroups[groupType] !== groupKey && !groupPropertiesToSet) {
            this.reloadFeatureFlags();
        }
    };
    /**
     * Resets only the group properties of the user currently logged in.
     */
    PostHog.prototype.resetGroups = function () {
        this.register({ $groups: {} });
        this.resetGroupPropertiesForFlags();
        // If groups changed, reload feature flags.
        this.reloadFeatureFlags();
    };
    /**
     * Set override person properties for feature flags.
     * This is used when dealing with new persons / where you don't want to wait for ingestion
     * to update user properties.
     */
    PostHog.prototype.setPersonPropertiesForFlags = function (properties, reloadFeatureFlags) {
        if (reloadFeatureFlags === void 0) { reloadFeatureFlags = true; }
        this.featureFlags.setPersonPropertiesForFlags(properties, reloadFeatureFlags);
    };
    PostHog.prototype.resetPersonPropertiesForFlags = function () {
        this.featureFlags.resetPersonPropertiesForFlags();
    };
    /**
     * Set override group properties for feature flags.
     * This is used when dealing with new groups / where you don't want to wait for ingestion
     * to update properties.
     * Takes in an object, the key of which is the group type.
     * For example:
     *     setGroupPropertiesForFlags({'organization': { name: 'CYZ', employees: '11' } })
     */
    PostHog.prototype.setGroupPropertiesForFlags = function (properties, reloadFeatureFlags) {
        if (reloadFeatureFlags === void 0) { reloadFeatureFlags = true; }
        this.featureFlags.setGroupPropertiesForFlags(properties, reloadFeatureFlags);
    };
    PostHog.prototype.resetGroupPropertiesForFlags = function (group_type) {
        this.featureFlags.resetGroupPropertiesForFlags(group_type);
    };
    /**
     * Clears super properties and generates a new random distinct_id for this instance.
     * Useful for clearing data when a user logs out.
     */
    PostHog.prototype.reset = function (reset_device_id) {
        var device_id = this.get_property('$device_id');
        this.persistence.clear();
        this.sessionPersistence.clear();
        this.persistence.set_user_state('anonymous');
        this.sessionManager.resetSessionId();
        var uuid = this.get_config('get_device_id')(_UUID());
        this.register_once({
            distinct_id: uuid,
            $device_id: reset_device_id ? uuid : device_id,
        }, '');
    };
    /**
     * Returns the current distinct id of the user. This is either the id automatically
     * generated by the library or the id that has been passed by a call to identify().
     *
     * ### Notes:
     *
     * get_distinct_id() can only be called after the PostHog library has finished loading.
     * init() has a loaded function available to handle this automatically. For example:
     *
     *     // set distinct_id after the posthog library has loaded
     *     posthog.init('YOUR PROJECT TOKEN', {
     *         loaded: function(posthog) {
     *             distinct_id = posthog.get_distinct_id();
     *         }
     *     });
     */
    PostHog.prototype.get_distinct_id = function () {
        return this.get_property('distinct_id');
    };
    PostHog.prototype.getGroups = function () {
        return this.get_property('$groups') || {};
    };
    /**
     * Create an alias, which PostHog will use to link two distinct_ids going forward (not retroactively).
     * Multiple aliases can map to the same original ID, but not vice-versa. Aliases can also be chained - the
     * following is a valid scenario:
     *
     *     posthog.alias('new_id', 'existing_id');
     *     ...
     *     posthog.alias('newer_id', 'new_id');
     *
     * If the original ID is not passed in, we will use the current distinct_id - probably the auto-generated GUID.
     *
     * ### Notes:
     *
     * The best practice is to call alias() when a unique ID is first created for a user
     * (e.g., when a user first registers for an account and provides an email address).
     * alias() should never be called more than once for a given user, except to
     * chain a newer ID to a previously new ID, as described above.
     *
     * @param {String} alias A unique identifier that you want to use for this user in the future.
     * @param {String} [original] The current identifier being used for this user.
     */
    PostHog.prototype.alias = function (alias, original) {
        // If the $people_distinct_id key exists in persistence, there has been a previous
        // posthog.people.identify() call made for this user. It is VERY BAD to make an alias with
        // this ID, as it will duplicate users.
        if (alias === this.get_property(PEOPLE_DISTINCT_ID_KEY)) {
            logger.critical('Attempting to create alias for existing People user - aborting.');
            return -2;
        }
        if (_isUndefined(original)) {
            original = this.get_distinct_id();
        }
        if (alias !== original) {
            this._register_single(ALIAS_ID_KEY, alias);
            return this.capture('$create_alias', { alias: alias, distinct_id: original });
        }
        else {
            console.error('alias matches current distinct_id - skipping api call.');
            this.identify(alias);
            return -1;
        }
    };
    /**
     * Update the configuration of a posthog library instance.
     *
     * The default config is:
     *
     *     {
     *       // PostHog API host
     *       api_host: 'https://app.posthog.com',
     *
     *       // HTTP method for capturing requests
     *       api_method: 'POST'
     *
     *       // PostHog web app host, currently only used by the Sentry integration.
     *       // This will only be different from api_host when using a reverse-proxied API host – in that case
     *       // the original web app host needs to be passed here so that links to the web app are still convenient.
     *       ui_host: 'https://app.posthog.com',
     *
     *       // Automatically capture clicks, form submissions and change events
     *       autocapture: true
     *
     *       // Capture rage clicks
     *       rageclick: true
     *
     *       // transport for sending requests ('XHR' or 'sendBeacon')
     *       // NB: sendBeacon should only be used for scenarios such as
     *       // page unload where a "best-effort" attempt to send is
     *       // acceptable; the sendBeacon API does not support callbacks
     *       // or any way to know the result of the request. PostHog
     *       // capturing via sendBeacon will not support any event-
     *       // batching or retry mechanisms.
     *       api_transport: 'XHR'
     *
     *       // super properties cookie expiration (in days)
     *       cookie_expiration: 365
     *
     *       // super properties span subdomains
     *       cross_subdomain_cookie: true
     *
     *       // debug mode
     *       debug: false
     *
     *       // if this is true, the posthog cookie or localStorage entry
     *       // will be deleted, and no user persistence will take place
     *       disable_persistence: false
     *
     *       // if this is true, PostHog will automatically determine
     *       // City, Region and Country data using the IP address of
     *       //the client
     *       ip: true
     *
     *       // opt users out of capturing by this PostHog instance by default
     *       opt_out_capturing_by_default: false
     *
     *       // opt users out of browser data storage by this PostHog instance by default
     *       opt_out_persistence_by_default: false
     *
     *       // persistence mechanism used by opt-in/opt-out methods - cookie
     *       // or localStorage - falls back to cookie if localStorage is unavailable
     *       opt_out_capturing_persistence_type: 'localStorage'
     *
     *       // customize the name of cookie/localStorage set by opt-in/opt-out methods
     *       opt_out_capturing_cookie_prefix: null
     *
     *       // type of persistent store for super properties (cookie/
     *       // localStorage) if set to 'localStorage', any existing
     *       // posthog cookie value with the same persistence_name
     *       // will be transferred to localStorage and deleted
     *       persistence: 'cookie'
     *
     *       // name for super properties persistent store
     *       persistence_name: ''
     *
     *       // names of properties/superproperties which should never
     *       // be sent with capture() calls
     *       property_blacklist: []
     *
     *       // if this is true, posthog cookies will be marked as
     *       // secure, meaning they will only be transmitted over https
     *       secure_cookie: false
     *
     *       // should we capture a page view on page load
     *       capture_pageview: true
     *
     *       // if you set upgrade to be true, the library will check for
     *       // a cookie from our old js library and import super
     *       // properties from it, then the old cookie is deleted
     *       // The upgrade config option only works in the initialization,
     *       // so make sure you set it when you create the library.
     *       upgrade: false
     *
     *       // if this is true, session recording is always disabled.
     *       disable_session_recording: false,
     *
     *       // extra HTTP request headers to set for each API request, in
     *       // the format {'Header-Name': value}
     *       xhr_headers: {}
     *
     *       // protocol for fetching in-app message resources, e.g.
     *       // 'https://' or 'http://'; defaults to '//' (which defers to the
     *       // current page's protocol)
     *       inapp_protocol: '//'
     *
     *       // whether to open in-app message link in new tab/window
     *       inapp_link_new_window: false
     *
     *      // a set of rrweb config options that PostHog users can configure
     *      // see https://github.com/rrweb-io/rrweb/blob/master/guide.md
     *      session_recording: {
     *         blockClass: 'ph-no-capture',
     *         blockSelector: null,
     *         ignoreClass: 'ph-ignore-input',
     *         maskAllInputs: true,
     *         maskInputOptions: {},
     *         maskInputFn: null,
     *         slimDOMOptions: {},
     *         collectFonts: false
     *      }
     *
     *      // prevent autocapture from capturing any attribute names on elements
     *      mask_all_element_attributes: false
     *
     *      // prevent autocapture from capturing textContent on all elements
     *      mask_all_text: false
     *
     *      // Anonymous users get a random UUID as their device by default.
     *      // This option allows overriding that option.
     *      get_device_id: (uuid) => uuid
     *     }
     *
     *
     * @param {Object} config A dictionary of new configuration values to update
     */
    PostHog.prototype.set_config = function (config) {
        var oldConfig = __assign({}, this.config);
        if (_isObject(config)) {
            _extend(this.config, config);
            if (!this.get_config('persistence_name')) {
                this.config.persistence_name = this.config.cookie_name;
            }
            if (!this.get_config('disable_persistence')) {
                this.config.disable_persistence = this.config.disable_cookie;
            }
            if (this.persistence) {
                this.persistence.update_config(this.config);
            }
            if (this.sessionPersistence) {
                this.sessionPersistence.update_config(this.config);
            }
            if (localStore.is_supported() && localStore.get('ph_debug') === 'true') {
                this.config.debug = true;
            }
            if (this.get_config('debug')) {
                Config.DEBUG = true;
            }
            if (this.sessionRecording && typeof config.disable_session_recording !== 'undefined') {
                if (oldConfig.disable_session_recording !== config.disable_session_recording) {
                    if (config.disable_session_recording) {
                        this.sessionRecording.stopRecording();
                    }
                    else {
                        this.sessionRecording.startRecordingIfEnabled();
                    }
                }
            }
        }
    };
    /**
     * turns session recording on, and updates the config option
     * disable_session_recording to false
     */
    PostHog.prototype.startSessionRecording = function () {
        this.set_config({ disable_session_recording: false });
    };
    /**
     * turns session recording off, and updates the config option
     * disable_session_recording to true
     */
    PostHog.prototype.stopSessionRecording = function () {
        this.set_config({ disable_session_recording: true });
    };
    /**
     * returns a boolean indicating whether session recording
     * is currently running
     */
    PostHog.prototype.sessionRecordingStarted = function () {
        var _a;
        return !!((_a = this.sessionRecording) === null || _a === void 0 ? void 0 : _a.started());
    };
    /**
     * returns a boolean indicating whether the toolbar loaded
     * @param toolbarParams
     */
    PostHog.prototype.loadToolbar = function (params) {
        return this.toolbar.loadToolbar(params);
    };
    /**
     * returns the current config object for the library.
     */
    PostHog.prototype.get_config = function (prop_name) {
        var _a;
        return (_a = this.config) === null || _a === void 0 ? void 0 : _a[prop_name];
    };
    /**
     * Returns the value of the super property named property_name. If no such
     * property is set, get_property() will return the undefined value.
     *
     * ### Notes:
     *
     * get_property() can only be called after the PostHog library has finished loading.
     * init() has a loaded function available to handle this automatically. For example:
     *
     *     // grab value for '$user_id' after the posthog library has loaded
     *     posthog.init('YOUR PROJECT TOKEN', {
     *         loaded: function(posthog) {
     *             user_id = posthog.get_property('$user_id');
     *         }
     *     });
     *
     * @param {String} property_name The name of the super property you want to retrieve
     */
    PostHog.prototype.get_property = function (property_name) {
        return this.persistence['props'][property_name];
    };
    /**
     * Returns the value of the session super property named property_name. If no such
     * property is set, getSessionProperty() will return the undefined value.
     *
     * ### Notes:
     *
     * This is based on browser-level `sessionStorage`, NOT the PostHog session.
     * getSessionProperty() can only be called after the PostHog library has finished loading.
     * init() has a loaded function available to handle this automatically. For example:
     *
     *     // grab value for 'user_id' after the posthog library has loaded
     *     posthog.init('YOUR PROJECT TOKEN', {
     *         loaded: function(posthog) {
     *             user_id = posthog.getSessionProperty('user_id');
     *         }
     *     });
     *
     * @param {String} property_name The name of the session super property you want to retrieve
     */
    PostHog.prototype.getSessionProperty = function (property_name) {
        return this.sessionPersistence['props'][property_name];
    };
    PostHog.prototype.toString = function () {
        var _a;
        var name = (_a = this.get_config('name')) !== null && _a !== void 0 ? _a : PRIMARY_INSTANCE_NAME;
        if (name !== PRIMARY_INSTANCE_NAME) {
            name = PRIMARY_INSTANCE_NAME + '.' + name;
        }
        return name;
    };
    // perform some housekeeping around GDPR opt-in/out state
    PostHog.prototype._gdpr_init = function () {
        var is_localStorage_requested = this.get_config('opt_out_capturing_persistence_type') === 'localStorage';
        // try to convert opt-in/out cookies to localStorage if possible
        if (is_localStorage_requested && localStore.is_supported()) {
            if (!this.has_opted_in_capturing() && this.has_opted_in_capturing({ persistence_type: 'cookie' })) {
                this.opt_in_capturing({ enable_persistence: false });
            }
            if (!this.has_opted_out_capturing() && this.has_opted_out_capturing({ persistence_type: 'cookie' })) {
                this.opt_out_capturing({ clear_persistence: false });
            }
            this.clear_opt_in_out_capturing({
                persistence_type: 'cookie',
                enable_persistence: false,
            });
        }
        // check whether the user has already opted out - if so, clear & disable persistence
        if (this.has_opted_out_capturing()) {
            this._gdpr_update_persistence({ clear_persistence: true });
            // check whether we should opt out by default
            // note: we don't clear persistence here by default since opt-out default state is often
            //       used as an initial state while GDPR information is being collected
        }
        else if (!this.has_opted_in_capturing() &&
            (this.get_config('opt_out_capturing_by_default') || cookieStore.get('ph_optout'))) {
            cookieStore.remove('ph_optout');
            this.opt_out_capturing({
                clear_persistence: this.get_config('opt_out_persistence_by_default'),
            });
        }
    };
    /**
     * Enable or disable persistence based on options
     * only enable/disable if persistence is not already in this state
     * @param {boolean} [options.clear_persistence] If true, will delete all data stored by the sdk in persistence and disable it
     * @param {boolean} [options.enable_persistence] If true, will re-enable sdk persistence
     */
    PostHog.prototype._gdpr_update_persistence = function (options) {
        var disabled;
        if (options && options['clear_persistence']) {
            disabled = true;
        }
        else if (options && options['enable_persistence']) {
            disabled = false;
        }
        else {
            return;
        }
        if (!this.get_config('disable_persistence') && this.persistence.disabled !== disabled) {
            this.persistence.set_disabled(disabled);
        }
        if (!this.get_config('disable_persistence') && this.sessionPersistence.disabled !== disabled) {
            this.sessionPersistence.set_disabled(disabled);
        }
    };
    // call a base gdpr function after constructing the appropriate token and options args
    PostHog.prototype._gdpr_call_func = function (func, options) {
        options = _extend({
            capture: this.capture.bind(this),
            persistence_type: this.get_config('opt_out_capturing_persistence_type'),
            cookie_prefix: this.get_config('opt_out_capturing_cookie_prefix'),
            cookie_expiration: this.get_config('cookie_expiration'),
            cross_subdomain_cookie: this.get_config('cross_subdomain_cookie'),
            secure_cookie: this.get_config('secure_cookie'),
        }, options || {});
        // check if localStorage can be used for recording opt out status, fall back to cookie if not
        if (!localStore.is_supported() && options['persistence_type'] === 'localStorage') {
            options['persistence_type'] = 'cookie';
        }
        return func(this.get_config('token'), {
            capture: options['capture'],
            captureEventName: options['capture_event_name'],
            captureProperties: options['capture_properties'],
            persistenceType: options['persistence_type'],
            persistencePrefix: options['cookie_prefix'],
            cookieExpiration: options['cookie_expiration'],
            crossSubdomainCookie: options['cross_subdomain_cookie'],
            secureCookie: options['secure_cookie'],
        });
    };
    /**
     * Opt the user in to data capturing and cookies/localstorage for this PostHog instance
     *
     * ### Usage
     *
     *     // opt user in
     *     posthog.opt_in_capturing();
     *
     *     // opt user in with specific event name, properties, cookie configuration
     *     posthog.opt_in_capturing({
     *         capture_event_name: 'User opted in',
     *         capture_event_properties: {
     *             'Email': 'jdoe@example.com'
     *         },
     *         cookie_expiration: 30,
     *         secure_cookie: true
     *     });
     *
     * @param {Object} [options] A dictionary of config options to override
     * @param {function} [options.capture] Function used for capturing a PostHog event to record the opt-in action (default is this PostHog instance's capture method)
     * @param {string} [options.capture_event_name=$opt_in] Event name to be used for capturing the opt-in action
     * @param {Object} [options.capture_properties] Set of properties to be captured along with the opt-in action
     * @param {boolean} [options.enable_persistence=true] If true, will re-enable sdk persistence
     * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
     * @param {string} [options.cookie_prefix=__ph_opt_in_out] Custom prefix to be used in the cookie/localstorage name
     * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this PostHog instance's config)
     * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this PostHog instance's config)
     * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this PostHog instance's config)
     */
    PostHog.prototype.opt_in_capturing = function (options) {
        options = _extend({
            enable_persistence: true,
        }, options || {});
        this._gdpr_call_func(optIn, options);
        this._gdpr_update_persistence(options);
    };
    /**
     * Opt the user out of data capturing and cookies/localstorage for this PostHog instance
     *
     * ### Usage
     *
     *     // opt user out
     *     posthog.opt_out_capturing();
     *
     *     // opt user out with different cookie configuration from PostHog instance
     *     posthog.opt_out_capturing({
     *         cookie_expiration: 30,
     *         secure_cookie: true
     *     });
     *
     * @param {Object} [options] A dictionary of config options to override
     * @param {boolean} [options.clear_persistence=true] If true, will delete all data stored by the sdk in persistence
     * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
     * @param {string} [options.cookie_prefix=__ph_opt_in_out] Custom prefix to be used in the cookie/localstorage name
     * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this PostHog instance's config)
     * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this PostHog instance's config)
     * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this PostHog instance's config)
     */
    PostHog.prototype.opt_out_capturing = function (options) {
        var _options = _extend({
            clear_persistence: true,
        }, options || {});
        this._gdpr_call_func(optOut, _options);
        this._gdpr_update_persistence(_options);
    };
    /**
     * Check whether the user has opted in to data capturing and cookies/localstorage for this PostHog instance
     *
     * ### Usage
     *
     *     const has_opted_in = posthog.has_opted_in_capturing();
     *     // use has_opted_in value
     *
     * @param {Object} [options] A dictionary of config options to override
     * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
     * @param {string} [options.cookie_prefix=__ph_opt_in_out] Custom prefix to be used in the cookie/localstorage name
     * @returns {boolean} current opt-in status
     */
    PostHog.prototype.has_opted_in_capturing = function (options) {
        return this._gdpr_call_func(hasOptedIn, options);
    };
    /**
     * Check whether the user has opted out of data capturing and cookies/localstorage for this PostHog instance
     *
     * ### Usage
     *
     *     const has_opted_out = posthog.has_opted_out_capturing();
     *     // use has_opted_out value
     *
     * @param {Object} [options] A dictionary of config options to override
     * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
     * @param {string} [options.cookie_prefix=__ph_opt_in_out] Custom prefix to be used in the cookie/localstorage name
     * @returns {boolean} current opt-out status
     */
    PostHog.prototype.has_opted_out_capturing = function (options) {
        return this._gdpr_call_func(hasOptedOut, options);
    };
    /**
     * Clear the user's opt in/out status of data capturing and cookies/localstorage for this PostHog instance
     *
     * ### Usage
     *
     *     // clear user's opt-in/out status
     *     posthog.clear_opt_in_out_capturing();
     *
     *     // clear user's opt-in/out status with specific cookie configuration - should match
     *     // configuration used when opt_in_capturing/opt_out_capturing methods were called.
     *     posthog.clear_opt_in_out_capturing({
     *         cookie_expiration: 30,
     *         secure_cookie: true
     *     });
     *
     * @param {Object} [options] A dictionary of config options to override
     * @param {boolean} [options.enable_persistence=true] If true, will re-enable sdk persistence
     * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
     * @param {string} [options.cookie_prefix=__ph_opt_in_out] Custom prefix to be used in the cookie/localstorage name
     * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this PostHog instance's config)
     * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this PostHog instance's config)
     * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this PostHog instance's config)
     */
    PostHog.prototype.clear_opt_in_out_capturing = function (options) {
        var _options = _extend({
            enable_persistence: true,
        }, options !== null && options !== void 0 ? options : {});
        this._gdpr_call_func(clearOptInOut, _options);
        this._gdpr_update_persistence(_options);
    };
    PostHog.prototype.debug = function (debug) {
        if (debug === false) {
            window.console.log("You've disabled debug mode.");
            localStorage && localStorage.removeItem('ph_debug');
            this.set_config({ debug: false });
        }
        else {
            window.console.log("You're now in debug mode. All calls to PostHog will be logged in your console.\nYou can disable this with `posthog.debug(false)`.");
            localStorage && localStorage.setItem('ph_debug', 'true');
            this.set_config({ debug: true });
        }
    };
    PostHog.prototype.decodeLZ64 = function (input) {
        return LZString.decompressFromBase64(input || null);
    };
    return PostHog;
}());
export { PostHog };
_safewrap_class(PostHog, ['identify']);
var instances = {};
var extend_mp = function () {
    // add all the sub posthog instances
    _each(instances, function (instance, name) {
        if (name !== PRIMARY_INSTANCE_NAME) {
            posthog_master[name] = instance;
        }
    });
};
var override_ph_init_func = function () {
    // we override the snippets init function to handle the case where a
    // user initializes the posthog library after the script loads & runs
    posthog_master['init'] = function (token, config, name) {
        if (name) {
            // initialize a sub library
            if (!posthog_master[name]) {
                posthog_master[name] = instances[name] = create_phlib(token || '', config || {}, name, function (instance) {
                    posthog_master[name] = instances[name] = instance;
                    instance._loaded();
                });
            }
            return posthog_master[name];
        }
        else {
            var instance = posthog_master;
            if (instances[PRIMARY_INSTANCE_NAME]) {
                // main posthog lib already initialized
                instance = instances[PRIMARY_INSTANCE_NAME];
            }
            else if (token) {
                // intialize the main posthog lib
                instance = create_phlib(token, config || {}, PRIMARY_INSTANCE_NAME, function (instance) {
                    instances[PRIMARY_INSTANCE_NAME] = instance;
                    instance._loaded();
                });
                instances[PRIMARY_INSTANCE_NAME] = instance;
            }
            ;
            posthog_master = instance;
            if (init_type === InitType.INIT_SNIPPET) {
                ;
                window[PRIMARY_INSTANCE_NAME] = posthog_master;
            }
            extend_mp();
            return instance;
        }
    };
};
var add_dom_loaded_handler = function () {
    // Cross browser DOM Loaded support
    function dom_loaded_handler() {
        // function flag since we only want to execute this once
        if (dom_loaded_handler.done) {
            return;
        }
        ;
        dom_loaded_handler.done = true;
        ENQUEUE_REQUESTS = false;
        _each(instances, function (inst) {
            inst._dom_loaded();
        });
    }
    if (document.addEventListener) {
        if (document.readyState === 'complete') {
            // safari 4 can fire the DOMContentLoaded event before loading all
            // external JS (including this file). you will see some copypasta
            // on the internet that checks for 'complete' and 'loaded', but
            // 'loaded' is an IE thing
            dom_loaded_handler();
        }
        else {
            document.addEventListener('DOMContentLoaded', dom_loaded_handler, false);
        }
    }
    // fallback handler, always will work
    _register_event(window, 'load', dom_loaded_handler, true);
};
export function init_from_snippet() {
    init_type = InitType.INIT_SNIPPET;
    if (_isUndefined(window.posthog)) {
        ;
        window.posthog = [];
    }
    posthog_master = window.posthog;
    if (posthog_master['__loaded'] || (posthog_master['config'] && posthog_master['persistence'])) {
        // lib has already been loaded at least once; we don't want to override the global object this time so bomb early
        console.error('PostHog library has already been downloaded at least once.');
        return;
    }
    // Load instances of the PostHog Library
    _each(posthog_master['_i'], function (item) {
        if (item && _isArray(item)) {
            instances[item[2]] = create_phlib.apply(void 0, __spreadArray([], __read(item), false));
        }
    });
    override_ph_init_func();
    posthog_master['init']();
    // Fire loaded events after updating the window's posthog object
    _each(instances, function (instance) {
        instance._loaded();
    });
    add_dom_loaded_handler();
}
export function init_as_module() {
    init_type = InitType.INIT_MODULE;
    posthog_master = new PostHog();
    override_ph_init_func();
    posthog_master['init']();
    add_dom_loaded_handler();
    return posthog_master;
}
//# sourceMappingURL=posthog-core.js.map