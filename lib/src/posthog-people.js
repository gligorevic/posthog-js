/* eslint camelcase: "off" */
import { addOptOutCheck } from './gdpr-utils';
import { _base64Encode, _copyAndTruncateStrings, _each, _encodeDates, _extend, _info, _isObject } from './utils';
var SET_ACTION = '$set';
var SET_ONCE_ACTION = '$set_once';
/**
 * PostHog People Object
 * @constructor
 */
var PostHogPeople = /** @class */ (function () {
    function PostHogPeople(posthog) {
        var _this = this;
        this._posthog = posthog;
        /*
         * Set properties on a user record.
         *
         * ### Usage:
         *
         *     posthog.people.set('gender', 'm');
         *
         *     // or set multiple properties at once
         *     posthog.people.set({
         *         'Company': 'Acme',
         *         'Plan': 'Premium',
         *         'Upgrade date': new Date()
         *     });
         *     // properties can be strings, integers, dates, or lists
         *
         * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
         * @param {*} [to] A value to set on the given property name
         * @param {Function} [callback] If provided, the callback will be called after capturing the event.
         */
        this.set = addOptOutCheck(posthog, function (prop, to, callback) {
            var data = _this.set_action(prop, to);
            // Update current user properties
            _this._posthog.setPersonPropertiesForFlags(data['$set'] || {});
            if (_isObject(prop)) {
                callback = to;
            }
            // make sure that the referrer info has been updated and saved
            if (_this._get_config('save_referrer')) {
                _this._posthog.sessionPersistence.update_referrer_info();
            }
            // update $set object with default people properties
            data[SET_ACTION] = _extend({}, _info.people_properties(), _this._posthog.sessionPersistence.get_referrer_info(), data[SET_ACTION]);
            return _this._send_request(data, callback);
        });
        /*
         * Set properties on a user record, only if they do not yet exist.
         * This will not overwrite previous people property values, unlike
         * people.set().
         *
         * ### Usage:
         *
         *     posthog.people.set_once('First Login Date', new Date());
         *
         *     // or set multiple properties at once
         *     posthog.people.set_once({
         *         'First Login Date': new Date(),
         *         'Starting Plan': 'Premium'
         *     });
         *
         *     // properties can be strings, integers or dates
         *
         * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
         * @param {*} [to] A value to set on the given property name
         * @param {Function} [callback] If provided, the callback will be called after capturing the event.
         */
        this.set_once = addOptOutCheck(posthog, function (prop, to, callback) {
            var data = _this.set_once_action(prop, to);
            if (_isObject(prop)) {
                callback = to;
            }
            return _this._send_request(data, callback);
        });
    }
    PostHogPeople.prototype.toString = function () {
        return this._posthog.toString() + '.people';
    };
    PostHogPeople.prototype._send_request = function (data, callback) {
        data['$token'] = this._get_config('token');
        data['$distinct_id'] = this._posthog.get_distinct_id();
        var device_id = this._posthog.get_property('$device_id');
        var user_id = this._posthog.get_property('$user_id');
        var had_persisted_distinct_id = this._posthog.get_property('$had_persisted_distinct_id');
        if (device_id) {
            data['$device_id'] = device_id;
        }
        if (user_id) {
            data['$user_id'] = user_id;
        }
        if (had_persisted_distinct_id) {
            data['$had_persisted_distinct_id'] = had_persisted_distinct_id;
        }
        var date_encoded_data = _encodeDates(data);
        var truncated_data = _copyAndTruncateStrings(date_encoded_data, this._get_config('properties_string_max_length'));
        var json_data = JSON.stringify(date_encoded_data);
        var encoded_data = _base64Encode(json_data);
        this._posthog._send_request(this._get_config('api_host') + '/engage/', { data: encoded_data }, {}, this._posthog._prepare_callback(callback, truncated_data));
        return truncated_data;
    };
    PostHogPeople.prototype._get_config = function (conf_var) {
        return this._posthog.get_config(conf_var);
    };
    PostHogPeople.prototype._is_reserved_property = function (prop) {
        return (prop === '$distinct_id' ||
            prop === '$token' ||
            prop === '$device_id' ||
            prop === '$user_id' ||
            prop === '$had_persisted_distinct_id');
    };
    // Internal methods for posthog.people API.
    // These methods shouldn't involve network I/O.
    PostHogPeople.prototype.set_action = function (prop, to) {
        return this.apiActionParser(SET_ACTION, prop, to);
    };
    PostHogPeople.prototype.set_once_action = function (prop, to) {
        return this.apiActionParser(SET_ONCE_ACTION, prop, to);
    };
    PostHogPeople.prototype.apiActionParser = function (actionType, prop, to) {
        var _this = this;
        var data = {};
        var props = {};
        if (_isObject(prop)) {
            _each(prop, function (v, k) {
                if (!_this._is_reserved_property(k)) {
                    props[k] = v;
                }
            });
        }
        else {
            props[prop] = to;
        }
        data[actionType] = props;
        return data;
    };
    return PostHogPeople;
}());
export { PostHogPeople };
//# sourceMappingURL=posthog-people.js.map