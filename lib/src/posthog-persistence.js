/* eslint camelcase: "off" */
import { _each, _extend, _include, _info, _isObject, _isUndefined, _strip_empty_properties, logger } from './utils';
import { cookieStore, localStore, localPlusCookieStore, memoryStore, sessionStore } from './storage';
/*
 * Constants
 */
// This key is deprecated, but we want to check for it to see whether aliasing is allowed.
export var PEOPLE_DISTINCT_ID_KEY = '$people_distinct_id';
export var ALIAS_ID_KEY = '__alias';
export var CAMPAIGN_IDS_KEY = '__cmpns';
export var EVENT_TIMERS_KEY = '__timers';
export var AUTOCAPTURE_DISABLED_SERVER_SIDE = '$autocapture_disabled_server_side';
export var SESSION_RECORDING_ENABLED_SERVER_SIDE = '$session_recording_enabled_server_side';
export var CONSOLE_LOG_RECORDING_ENABLED_SERVER_SIDE = '$console_log_recording_enabled_server_side';
export var SESSION_RECORDING_RECORDER_VERSION_SERVER_SIDE = '$session_recording_recorder_version_server_side'; // follows rrweb versioning
export var SESSION_ID = '$sesid';
export var ENABLED_FEATURE_FLAGS = '$enabled_feature_flags';
export var PERSISTENCE_EARLY_ACCESS_FEATURES = '$early_access_features';
export var STORED_PERSON_PROPERTIES_KEY = '$stored_person_properties';
export var STORED_GROUP_PROPERTIES_KEY = '$stored_group_properties';
var USER_STATE = '$user_state';
export var RESERVED_PROPERTIES = [
    PEOPLE_DISTINCT_ID_KEY,
    ALIAS_ID_KEY,
    CAMPAIGN_IDS_KEY,
    EVENT_TIMERS_KEY,
    SESSION_RECORDING_ENABLED_SERVER_SIDE,
    SESSION_ID,
    ENABLED_FEATURE_FLAGS,
    USER_STATE,
    PERSISTENCE_EARLY_ACCESS_FEATURES,
    STORED_GROUP_PROPERTIES_KEY,
    STORED_PERSON_PROPERTIES_KEY,
];
var CASE_INSENSITIVE_PERSISTENCE_TYPES = [
    'cookie',
    'localstorage',
    'localstorage+cookie',
    'sessionstorage',
    'memory',
];
/**
 * PostHog Persistence Object
 * @constructor
 */
var PostHogPersistence = /** @class */ (function () {
    function PostHogPersistence(config) {
        // clean chars that aren't accepted by the http spec for cookie values
        // https://datatracker.ietf.org/doc/html/rfc2616#section-2.2
        var token = '';
        if (config['token']) {
            token = config['token'].replace(/\+/g, 'PL').replace(/\//g, 'SL').replace(/=/g, 'EQ');
        }
        this.props = {};
        this.campaign_params_saved = false;
        this.custom_campaign_params = config['custom_campaign_params'] || [];
        if (config['persistence_name']) {
            this.name = 'ph_' + config['persistence_name'];
        }
        else {
            this.name = 'ph_' + token + '_posthog';
        }
        if (CASE_INSENSITIVE_PERSISTENCE_TYPES.indexOf(config['persistence'].toLowerCase()) === -1) {
            logger.critical('Unknown persistence type ' + config['persistence'] + '; falling back to cookie');
            config['persistence'] = 'cookie';
        }
        // We handle storage type in a case-insensitive way for backwards compatibility
        var storage_type = config['persistence'].toLowerCase();
        if (storage_type === 'localstorage' && localStore.is_supported()) {
            this.storage = localStore;
        }
        else if (storage_type === 'localstorage+cookie' && localPlusCookieStore.is_supported()) {
            this.storage = localPlusCookieStore;
        }
        else if (storage_type === 'sessionstorage' && sessionStore.is_supported()) {
            this.storage = sessionStore;
        }
        else if (storage_type === 'memory') {
            this.storage = memoryStore;
        }
        else {
            this.storage = cookieStore;
        }
        this.user_state = 'anonymous';
        this.load();
        this.update_config(config);
        this.save();
    }
    PostHogPersistence.prototype.properties = function () {
        var p = {};
        // Filter out reserved properties
        _each(this.props, function (v, k) {
            if (k === ENABLED_FEATURE_FLAGS && typeof v === 'object') {
                var keys = Object.keys(v);
                for (var i = 0; i < keys.length; i++) {
                    p["$feature/".concat(keys[i])] = v[keys[i]];
                }
            }
            else if (!_include(RESERVED_PROPERTIES, k)) {
                p[k] = v;
            }
        });
        return p;
    };
    PostHogPersistence.prototype.load = function () {
        if (this.disabled) {
            return;
        }
        var entry = this.storage.parse(this.name);
        if (entry) {
            this.props = _extend({}, entry);
        }
    };
    /**
     * NOTE: Saving frequently causes issues with Recordings and Consent Management Platform (CMP) tools which
     * observe cookie changes, and modify their UI, often causing infinite loops.
     * As such callers of this should ideally check that the data has changed beforehand
     */
    PostHogPersistence.prototype.save = function () {
        if (this.disabled) {
            return;
        }
        this.storage.set(this.name, this.props, this.expire_days, this.cross_subdomain, this.secure);
    };
    PostHogPersistence.prototype.remove = function () {
        // remove both domain and subdomain cookies
        this.storage.remove(this.name, false);
        this.storage.remove(this.name, true);
    };
    // removes the storage entry and deletes all loaded data
    // forced name for tests
    PostHogPersistence.prototype.clear = function () {
        this.remove();
        this.props = {};
    };
    /**
     * @param {Object} props
     * @param {*=} default_value
     * @param {number=} days
     */
    PostHogPersistence.prototype.register_once = function (props, default_value, days) {
        var _this = this;
        if (_isObject(props)) {
            if (typeof default_value === 'undefined') {
                default_value = 'None';
            }
            this.expire_days = typeof days === 'undefined' ? this.default_expiry : days;
            var hasChanges_1 = false;
            _each(props, function (val, prop) {
                if (!_this.props.hasOwnProperty(prop) || _this.props[prop] === default_value) {
                    _this.props[prop] = val;
                    hasChanges_1 = true;
                }
            });
            if (hasChanges_1) {
                this.save();
                return true;
            }
        }
        return false;
    };
    /**
     * @param {Object} props
     * @param {number=} days
     */
    PostHogPersistence.prototype.register = function (props, days) {
        var _this = this;
        if (_isObject(props)) {
            this.expire_days = typeof days === 'undefined' ? this.default_expiry : days;
            var hasChanges_2 = false;
            _each(props, function (val, prop) {
                if (props.hasOwnProperty(prop) && _this.props[prop] !== val) {
                    _this.props[prop] = val;
                    hasChanges_2 = true;
                }
            });
            if (hasChanges_2) {
                this.save();
                return true;
            }
        }
        return false;
    };
    PostHogPersistence.prototype.unregister = function (prop) {
        if (prop in this.props) {
            delete this.props[prop];
            this.save();
        }
    };
    PostHogPersistence.prototype.update_campaign_params = function () {
        if (!this.campaign_params_saved) {
            this.register(_info.campaignParams(this.custom_campaign_params));
            this.campaign_params_saved = true;
        }
    };
    PostHogPersistence.prototype.update_search_keyword = function () {
        this.register(_info.searchInfo());
    };
    PostHogPersistence.prototype.update_referrer_info = function () {
        this.register({
            $referrer: this.props['$referrer'] || _info.referrer(),
            $referring_domain: this.props['$referring_domain'] || _info.referringDomain(),
        });
    };
    PostHogPersistence.prototype.get_referrer_info = function () {
        return _strip_empty_properties({
            $referrer: this['props']['$referrer'],
            $referring_domain: this['props']['$referring_domain'],
        });
    };
    // safely fills the passed in object with stored properties,
    // does not override any properties defined in both
    // returns the passed in object
    PostHogPersistence.prototype.safe_merge = function (props) {
        _each(this.props, function (val, prop) {
            if (!(prop in props)) {
                props[prop] = val;
            }
        });
        return props;
    };
    PostHogPersistence.prototype.update_config = function (config) {
        this.default_expiry = this.expire_days = config['cookie_expiration'];
        this.set_disabled(config['disable_persistence']);
        this.set_cross_subdomain(config['cross_subdomain_cookie']);
        this.set_secure(config['secure_cookie']);
    };
    PostHogPersistence.prototype.set_disabled = function (disabled) {
        this.disabled = disabled;
        if (this.disabled) {
            this.remove();
        }
        else {
            this.save();
        }
    };
    PostHogPersistence.prototype.set_cross_subdomain = function (cross_subdomain) {
        if (cross_subdomain !== this.cross_subdomain) {
            this.cross_subdomain = cross_subdomain;
            this.remove();
            this.save();
        }
    };
    PostHogPersistence.prototype.get_cross_subdomain = function () {
        return !!this.cross_subdomain;
    };
    PostHogPersistence.prototype.set_secure = function (secure) {
        if (secure !== this.secure) {
            this.secure = secure;
            this.remove();
            this.save();
        }
    };
    PostHogPersistence.prototype.set_event_timer = function (event_name, timestamp) {
        var timers = this.props[EVENT_TIMERS_KEY] || {};
        timers[event_name] = timestamp;
        this.props[EVENT_TIMERS_KEY] = timers;
        this.save();
    };
    PostHogPersistence.prototype.remove_event_timer = function (event_name) {
        var timers = this.props[EVENT_TIMERS_KEY] || {};
        var timestamp = timers[event_name];
        if (!_isUndefined(timestamp)) {
            delete this.props[EVENT_TIMERS_KEY][event_name];
            this.save();
        }
        return timestamp;
    };
    PostHogPersistence.prototype.get_user_state = function () {
        return this.props[USER_STATE] || 'anonymous';
    };
    PostHogPersistence.prototype.set_user_state = function (state) {
        this.props[USER_STATE] = state;
        this.save();
    };
    return PostHogPersistence;
}());
export { PostHogPersistence };
//# sourceMappingURL=posthog-persistence.js.map