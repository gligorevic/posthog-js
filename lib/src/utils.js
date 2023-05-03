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
import Config from './config';
/*
 * Saved references to long variable names, so that closure compiler can
 * minimize file size.
 */
var ArrayProto = Array.prototype;
var ObjProto = Object.prototype;
var toString = ObjProto.toString;
var hasOwnProperty = ObjProto.hasOwnProperty;
var win = typeof window !== 'undefined' ? window : {};
var navigator = win.navigator || { userAgent: '' };
var document = win.document || {};
var userAgent = navigator.userAgent;
var localDomains = ['localhost', '127.0.0.1'];
var nativeForEach = ArrayProto.forEach, nativeIndexOf = ArrayProto.indexOf, nativeIsArray = Array.isArray, breaker = {};
// Console override
var logger = {
    /** @type {function(...*)} */
    log: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (Config.DEBUG && !_isUndefined(window.console) && window.console) {
            // Don't log PostHog debug messages in rrweb
            var log_1 = '__rrweb_original__' in window.console.log
                ? window.console.log['__rrweb_original__']
                : window.console.log;
            try {
                log_1.apply(window.console, args);
            }
            catch (err) {
                _eachArray(args, function (arg) {
                    log_1(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    error: function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
        if (Config.DEBUG && !_isUndefined(window.console) && window.console) {
            var args = __spreadArray(['PostHog error:'], __read(_args), false);
            // Don't log PostHog debug messages in rrweb
            var error_1 = '__rrweb_original__' in window.console.error
                ? window.console.error['__rrweb_original__']
                : window.console.error;
            try {
                error_1.apply(window.console, args);
            }
            catch (err) {
                _eachArray(args, function (arg) {
                    error_1(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    critical: function () {
        var _args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _args[_i] = arguments[_i];
        }
        if (!_isUndefined(window.console) && window.console) {
            var args = __spreadArray(['PostHog error:'], __read(_args), false);
            // Don't log PostHog debug messages in rrweb
            var error_2 = '__rrweb_original__' in window.console.error
                ? window.console.error['__rrweb_original__']
                : window.console.error;
            try {
                error_2.apply(window.console, args);
            }
            catch (err) {
                _eachArray(args, function (arg) {
                    error_2(arg);
                });
            }
        }
    },
};
// UNDERSCORE
// Embed part of the Underscore Library
export var _trim = function (str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};
export var _bind_instance_methods = function (obj) {
    for (var func in obj) {
        if (typeof obj[func] === 'function') {
            obj[func] = obj[func].bind(obj);
        }
    }
};
/**
 * @param {*=} obj
 * @param {function(...*)=} iterator
 * @param {Object=} thisArg
 */
export function _each(obj, iterator, thisArg) {
    if (obj === null || obj === undefined) {
        return;
    }
    if (nativeForEach && Array.isArray(obj) && obj.forEach === nativeForEach) {
        obj.forEach(iterator, thisArg);
    }
    else if ('length' in obj && obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(thisArg, obj[i], i) === breaker) {
                return;
            }
        }
    }
    else {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                if (iterator.call(thisArg, obj[key], key) === breaker) {
                    return;
                }
            }
        }
    }
}
export function _eachArray(obj, iterator, thisArg) {
    if (Array.isArray(obj)) {
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, thisArg);
        }
        else if ('length' in obj && obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(thisArg, obj[i], i) === breaker) {
                    return;
                }
            }
        }
    }
}
export var _extend = function (obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    _eachArray(args, function (source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};
export var _isArray = nativeIsArray ||
    function (obj) {
        return toString.call(obj) === '[object Array]';
    };
// from a comment on http://dbj.org/dbj/?p=286
// fails on only one very rare and deliberate custom object:
// let bomb = { toString : undefined, valueOf: function(o) { return "function BOMBA!"; }};
export var _isFunction = function (f) {
    try {
        return /^\s*\bfunction\b/.test(f);
    }
    catch (x) {
        return false;
    }
};
export var _include = function (obj, target) {
    var found = false;
    if (obj === null) {
        return found;
    }
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
        return obj.indexOf(target) != -1;
    }
    _each(obj, function (value) {
        if (found || (found = value === target)) {
            return breaker;
        }
        return;
    });
    return found;
};
export function _includes(str, needle) {
    return str.indexOf(needle) !== -1;
}
/**
 * Object.entries() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
 */
export function _entries(obj) {
    var ownProps = Object.keys(obj);
    var i = ownProps.length;
    var resArray = new Array(i); // preallocate the Array
    while (i--) {
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }
    return resArray;
}
// Underscore Addons
export var _isObject = function (obj) {
    return obj === Object(obj) && !_isArray(obj);
};
export var _isEmptyObject = function (obj) {
    if (_isObject(obj)) {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    return false;
};
export var _isUndefined = function (obj) {
    return obj === void 0;
};
export var _isString = function (obj) {
    return toString.call(obj) == '[object String]';
};
export var _isDate = function (obj) {
    return toString.call(obj) == '[object Date]';
};
export var _isNumber = function (obj) {
    return toString.call(obj) == '[object Number]';
};
export var _encodeDates = function (obj) {
    _each(obj, function (v, k) {
        if (_isDate(v)) {
            obj[k] = _formatDate(v);
        }
        else if (_isObject(v)) {
            obj[k] = _encodeDates(v); // recurse
        }
    });
    return obj;
};
export var _timestamp = function () {
    Date.now =
        Date.now ||
            function () {
                return +new Date();
            };
    return Date.now();
};
export var _formatDate = function (d) {
    // YYYY-MM-DDTHH:MM:SS in UTC
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    return (d.getUTCFullYear() +
        '-' +
        pad(d.getUTCMonth() + 1) +
        '-' +
        pad(d.getUTCDate()) +
        'T' +
        pad(d.getUTCHours()) +
        ':' +
        pad(d.getUTCMinutes()) +
        ':' +
        pad(d.getUTCSeconds()));
};
export var _safewrap = function (f) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return f.apply(this, args);
        }
        catch (e) {
            logger.critical('Implementation error. Please turn on debug and contact support@posthog.com.');
            logger.critical(e);
        }
    };
};
// eslint-disable-next-line @typescript-eslint/ban-types
export var _safewrap_class = function (klass, functions) {
    for (var i = 0; i < functions.length; i++) {
        klass.prototype[functions[i]] = _safewrap(klass.prototype[functions[i]]);
    }
};
export var _safewrap_instance_methods = function (obj) {
    for (var func in obj) {
        if (typeof obj[func] === 'function') {
            obj[func] = _safewrap(obj[func]);
        }
    }
};
export var _strip_empty_properties = function (p) {
    var ret = {};
    _each(p, function (v, k) {
        if (_isString(v) && v.length > 0) {
            ret[k] = v;
        }
    });
    return ret;
};
/**
 * Deep copies an object.
 * It handles cycles by replacing all references to them with `undefined`
 * Also supports customizing native values
 *
 * @param value
 * @param customizer
 * @returns {{}|undefined|*}
 */
function deepCircularCopy(value, customizer) {
    var COPY_IN_PROGRESS_SET = new Set();
    function internalDeepCircularCopy(value, key) {
        if (value !== Object(value))
            return customizer ? customizer(value, key) : value; // primitive value
        if (COPY_IN_PROGRESS_SET.has(value))
            return undefined;
        COPY_IN_PROGRESS_SET.add(value);
        var result;
        if (_isArray(value)) {
            result = [];
            _eachArray(value, function (it) {
                result.push(internalDeepCircularCopy(it));
            });
        }
        else {
            result = {};
            _each(value, function (val, key) {
                if (!COPY_IN_PROGRESS_SET.has(val)) {
                    ;
                    result[key] = internalDeepCircularCopy(val, key);
                }
            });
        }
        return result;
    }
    return internalDeepCircularCopy(value);
}
var LONG_STRINGS_ALLOW_LIST = ['$performance_raw'];
export function _copyAndTruncateStrings(object, maxStringLength) {
    return deepCircularCopy(object, function (value, key) {
        if (key && LONG_STRINGS_ALLOW_LIST.indexOf(key) > -1) {
            return value;
        }
        if (typeof value === 'string' && maxStringLength !== null) {
            return value.slice(0, maxStringLength);
        }
        return value;
    });
}
export function _base64Encode(data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = '';
    var tmp_arr = [];
    if (!data) {
        return data;
    }
    data = _utf8Encode(data);
    do {
        // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
        bits = (o1 << 16) | (o2 << 8) | o3;
        h1 = (bits >> 18) & 0x3f;
        h2 = (bits >> 12) & 0x3f;
        h3 = (bits >> 6) & 0x3f;
        h4 = bits & 0x3f;
        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);
    enc = tmp_arr.join('');
    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }
    return enc;
}
export var _utf8Encode = function (string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = '', start, end;
    var stringl = 0, n;
    start = end = 0;
    stringl = string.length;
    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
        if (c1 < 128) {
            end++;
        }
        else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        }
        else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.substring(start, string.length);
    }
    return utftext;
};
export var _UUID = (function () {
    // Time/ticks information
    // 1*new Date() is a cross browser version of Date.now()
    var T = function () {
        var d = new Date().valueOf();
        var i = 0;
        // this while loop figures how many browser ticks go by
        // before 1*new Date() returns a new number, ie the amount
        // of ticks that go by per millisecond
        while (d == new Date().valueOf()) {
            i++;
        }
        return d.toString(16) + i.toString(16);
    };
    // Math.Random entropy
    var R = function () {
        return Math.random().toString(16).replace('.', '');
    };
    // User agent entropy
    // This function takes the user agent string, and then xors
    // together each sequence of 8 bytes.  This produces a final
    // sequence of 8 bytes which it returns as hex.
    var UA = function () {
        var ua = userAgent;
        var i, ch, ret = 0, buffer = [];
        function xor(result, byte_array) {
            var j, tmp = 0;
            for (j = 0; j < byte_array.length; j++) {
                tmp |= buffer[j] << (j * 8);
            }
            return result ^ tmp;
        }
        for (i = 0; i < ua.length; i++) {
            ch = ua.charCodeAt(i);
            buffer.unshift(ch & 0xff);
            if (buffer.length >= 4) {
                ret = xor(ret, buffer);
                buffer = [];
            }
        }
        if (buffer.length > 0) {
            ret = xor(ret, buffer);
        }
        return ret.toString(16);
    };
    return function () {
        var se = typeof window !== 'undefined' ? (window.screen.height * window.screen.width).toString(16) : '0';
        return T() + '-' + R() + '-' + UA() + '-' + se + '-' + T();
    };
})();
// _.isBlockedUA()
// This is to block various web spiders from executing our JS and
// sending false capturing data
export var _isBlockedUA = function (ua) {
    if (/(google web preview|baiduspider|yandexbot|bingbot|googlebot|yahoo! slurp|ahrefsbot|facebookexternalhit|facebookcatalog|applebot|semrushbot|duckduckbot|twitterbot|rogerbot|linkedinbot|mj12bot|sitebulb|bot.htm|bot.php|hubspot|crawler)/i.test(ua)) {
        return true;
    }
    return false;
};
/**
 * @param {Object=} formdata
 * @param {string=} arg_separator
 */
export var _HTTPBuildQuery = function (formdata, arg_separator) {
    if (arg_separator === void 0) { arg_separator = '&'; }
    var use_val;
    var use_key;
    var tph_arr = [];
    _each(formdata, function (val, key) {
        use_val = encodeURIComponent(val.toString());
        use_key = encodeURIComponent(key);
        tph_arr[tph_arr.length] = use_key + '=' + use_val;
    });
    return tph_arr.join(arg_separator);
};
export var _getQueryParam = function (url, param) {
    // Expects a raw URL
    var cleanParam = param.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regexS = '[\\?&]' + cleanParam + '=([^&#]*)';
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    if (results === null || (results && typeof results[1] !== 'string' && results[1].length)) {
        return '';
    }
    else {
        var result = results[1];
        try {
            result = decodeURIComponent(result);
        }
        catch (err) {
            logger.error('Skipping decoding for malformed query param: ' + result);
        }
        return result.replace(/\+/g, ' ');
    }
};
export var _getHashParam = function (hash, param) {
    var matches = hash.match(new RegExp(param + '=([^&]*)'));
    return matches ? matches[1] : null;
};
export var _register_event = (function () {
    // written by Dean Edwards, 2005
    // with input from Tino Zijdel - crisp@xs4all.nl
    // with input from Carl Sverre - mail@carlsverre.com
    // with input from PostHog
    // http://dean.edwards.name/weblog/2005/10/add-event/
    // https://gist.github.com/1930440
    /**
     * @param {Object} element
     * @param {string} type
     * @param {function(...*)} handler
     * @param {boolean=} oldSchool
     * @param {boolean=} useCapture
     */
    var register_event = function (element, type, handler, oldSchool, useCapture) {
        if (!element) {
            logger.error('No valid element provided to register_event');
            return;
        }
        if (element.addEventListener && !oldSchool) {
            element.addEventListener(type, handler, !!useCapture);
        }
        else {
            var ontype = 'on' + type;
            var old_handler = element[ontype] // can be undefined
            ;
            element[ontype] = makeHandler(element, handler, old_handler);
        }
    };
    function makeHandler(element, new_handler, old_handlers) {
        return function (event) {
            event = event || fixEvent(window.event);
            // this basically happens in firefox whenever another script
            // overwrites the onload callback and doesn't pass the event
            // object to previously defined callbacks.  All the browsers
            // that don't define window.event implement addEventListener
            // so the dom_loaded handler will still be fired as usual.
            if (!event) {
                return undefined;
            }
            var ret = true;
            var old_result;
            if (_isFunction(old_handlers)) {
                old_result = old_handlers(event);
            }
            var new_result = new_handler.call(element, event);
            if (false === old_result || false === new_result) {
                ret = false;
            }
            return ret;
        };
    }
    function fixEvent(event) {
        if (event) {
            event.preventDefault = fixEvent.preventDefault;
            event.stopPropagation = fixEvent.stopPropagation;
        }
        return event;
    }
    fixEvent.preventDefault = function () {
        ;
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function () {
        ;
        this.cancelBubble = true;
    };
    return register_event;
})();
export var isLocalhost = function () {
    return localDomains.includes(location.hostname);
};
export function loadScript(scriptUrlToLoad, callback) {
    var addScript = function () {
        var _a;
        var scriptTag = document.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.src = scriptUrlToLoad;
        scriptTag.onload = function (event) { return callback(undefined, event); };
        scriptTag.onerror = function (error) { return callback(error); };
        var scripts = document.querySelectorAll('body > script');
        if (scripts.length > 0) {
            (_a = scripts[0].parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(scriptTag, scripts[0]);
        }
        else {
            // In exceptional situations this call might load before the DOM is fully ready.
            document.body.appendChild(scriptTag);
        }
    };
    if (document.body) {
        addScript();
    }
    else {
        document.addEventListener('DOMContentLoaded', addScript);
    }
}
export var _info = {
    campaignParams: function (customParams) {
        var campaign_keywords = [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
            'gclid',
            'fbclid',
            'msclkid',
        ].concat(customParams || []);
        var params = {};
        _each(campaign_keywords, function (kwkey) {
            var kw = _getQueryParam(document.URL, kwkey);
            if (kw.length) {
                params[kwkey] = kw;
            }
        });
        return params;
    },
    searchEngine: function () {
        var referrer = document.referrer;
        if (!referrer) {
            return null;
        }
        else if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
            return 'google';
        }
        else if (referrer.search('https?://(.*)bing.com') === 0) {
            return 'bing';
        }
        else if (referrer.search('https?://(.*)yahoo.com') === 0) {
            return 'yahoo';
        }
        else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
            return 'duckduckgo';
        }
        else {
            return null;
        }
    },
    searchInfo: function () {
        var search = _info.searchEngine(), param = search != 'yahoo' ? 'q' : 'p', ret = {};
        if (search !== null) {
            ret['$search_engine'] = search;
            var keyword = _getQueryParam(document.referrer, param);
            if (keyword.length) {
                ret['ph_keyword'] = keyword;
            }
        }
        return ret;
    },
    /**
     * This function detects which browser is running this script.
     * The order of the checks are important since many user agents
     * include key words used in later checks.
     */
    browser: function (user_agent, vendor, opera) {
        vendor = vendor || ''; // vendor is undefined for at least IE9
        if (opera || _includes(user_agent, ' OPR/')) {
            if (_includes(user_agent, 'Mini')) {
                return 'Opera Mini';
            }
            return 'Opera';
        }
        else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
            return 'BlackBerry';
        }
        else if (_includes(user_agent, 'IEMobile') || _includes(user_agent, 'WPDesktop')) {
            return 'Internet Explorer Mobile';
        }
        else if (_includes(user_agent, 'SamsungBrowser/')) {
            // https://developer.samsung.com/internet/user-agent-string-format
            return 'Samsung Internet';
        }
        else if (_includes(user_agent, 'Edge') || _includes(user_agent, 'Edg/')) {
            return 'Microsoft Edge';
        }
        else if (_includes(user_agent, 'FBIOS')) {
            return 'Facebook Mobile';
        }
        else if (_includes(user_agent, 'Chrome')) {
            return 'Chrome';
        }
        else if (_includes(user_agent, 'CriOS')) {
            return 'Chrome iOS';
        }
        else if (_includes(user_agent, 'UCWEB') || _includes(user_agent, 'UCBrowser')) {
            return 'UC Browser';
        }
        else if (_includes(user_agent, 'FxiOS')) {
            return 'Firefox iOS';
        }
        else if (_includes(vendor, 'Apple')) {
            if (_includes(user_agent, 'Mobile')) {
                return 'Mobile Safari';
            }
            return 'Safari';
        }
        else if (_includes(user_agent, 'Android')) {
            return 'Android Mobile';
        }
        else if (_includes(user_agent, 'Konqueror')) {
            return 'Konqueror';
        }
        else if (_includes(user_agent, 'Firefox')) {
            return 'Firefox';
        }
        else if (_includes(user_agent, 'MSIE') || _includes(user_agent, 'Trident/')) {
            return 'Internet Explorer';
        }
        else if (_includes(user_agent, 'Gecko')) {
            return 'Mozilla';
        }
        else {
            return '';
        }
    },
    /**
     * This function detects which browser version is running this script,
     * parsing major and minor version (e.g., 42.1). User agent strings from:
     * http://www.useragentstring.com/pages/useragentstring.php
     */
    browserVersion: function (userAgent, vendor, opera) {
        var browser = _info.browser(userAgent, vendor, opera);
        var versionRegexs = {
            'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
            'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
            Chrome: /Chrome\/(\d+(\.\d+)?)/,
            'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
            'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
            Safari: /Version\/(\d+(\.\d+)?)/,
            'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
            Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
            Firefox: /Firefox\/(\d+(\.\d+)?)/,
            'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
            Konqueror: /Konqueror:(\d+(\.\d+)?)/,
            BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
            'Android Mobile': /android\s(\d+(\.\d+)?)/,
            'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
            'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
            Mozilla: /rv:(\d+(\.\d+)?)/,
        };
        var regex = versionRegexs[browser];
        if (regex === undefined) {
            return null;
        }
        var matches = userAgent.match(regex);
        if (!matches) {
            return null;
        }
        return parseFloat(matches[matches.length - 2]);
    },
    browserLanguage: function () {
        return (navigator.language || // Any modern browser
            navigator.userLanguage // IE11
        );
    },
    os: function () {
        var a = userAgent;
        if (/Windows/i.test(a)) {
            if (/Phone/.test(a) || /WPDesktop/.test(a)) {
                return 'Windows Phone';
            }
            return 'Windows';
        }
        else if (/(iPhone|iPad|iPod)/.test(a)) {
            return 'iOS';
        }
        else if (/Android/.test(a)) {
            return 'Android';
        }
        else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
            return 'BlackBerry';
        }
        else if (/Mac/i.test(a)) {
            return 'Mac OS X';
        }
        else if (/Linux/.test(a)) {
            return 'Linux';
        }
        else if (/CrOS/.test(a)) {
            return 'Chrome OS';
        }
        else {
            return '';
        }
    },
    device: function (user_agent) {
        if (/Windows Phone/i.test(user_agent) || /WPDesktop/.test(user_agent)) {
            return 'Windows Phone';
        }
        else if (/iPad/.test(user_agent)) {
            return 'iPad';
        }
        else if (/iPod/.test(user_agent)) {
            return 'iPod Touch';
        }
        else if (/iPhone/.test(user_agent)) {
            return 'iPhone';
        }
        else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
            return 'BlackBerry';
        }
        else if (/Android/.test(user_agent) && !/Mobile/.test(user_agent)) {
            return 'Android Tablet';
        }
        else if (/Android/.test(user_agent)) {
            return 'Android';
        }
        else {
            return '';
        }
    },
    deviceType: function (user_agent) {
        var device = this.device(user_agent);
        if (device === 'iPad' || device === 'Android Tablet') {
            return 'Tablet';
        }
        else if (device) {
            return 'Mobile';
        }
        else {
            return 'Desktop';
        }
    },
    referrer: function () {
        return document.referrer || '$direct';
    },
    referringDomain: function () {
        if (!document.referrer) {
            return '$direct';
        }
        var parser = document.createElement('a'); // Unfortunately we cannot use new URL due to IE11
        parser.href = document.referrer;
        return parser.host;
    },
    properties: function () {
        return _extend(_strip_empty_properties({
            $os: _info.os(),
            $browser: _info.browser(userAgent, navigator.vendor, win.opera),
            $device: _info.device(userAgent),
            $device_type: _info.deviceType(userAgent),
        }), {
            $current_url: win === null || win === void 0 ? void 0 : win.location.href,
            $host: win === null || win === void 0 ? void 0 : win.location.host,
            $pathname: win === null || win === void 0 ? void 0 : win.location.pathname,
            $browser_version: _info.browserVersion(userAgent, navigator.vendor, win.opera),
            $browser_language: _info.browserLanguage(),
            $screen_height: win === null || win === void 0 ? void 0 : win.screen.height,
            $screen_width: win === null || win === void 0 ? void 0 : win.screen.width,
            $viewport_height: win === null || win === void 0 ? void 0 : win.innerHeight,
            $viewport_width: win === null || win === void 0 ? void 0 : win.innerWidth,
            $lib: 'web',
            $lib_version: Config.LIB_VERSION,
            $insert_id: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10),
            $time: _timestamp() / 1000, // epoch time in seconds
        });
    },
    people_properties: function () {
        return _extend(_strip_empty_properties({
            $os: _info.os(),
            $browser: _info.browser(userAgent, navigator.vendor, win.opera),
        }), {
            $browser_version: _info.browserVersion(userAgent, navigator.vendor, win.opera),
        });
    },
};
export { win as window, userAgent, logger, document };
//# sourceMappingURL=utils.js.map