/**
 * GDPR utils
 *
 * The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection
 * and privacy for all individuals within the European Union. It addresses the export of personal
 * data outside the EU. The GDPR aims primarily to give control back to citizens and residents
 * over their personal data and to simplify the regulatory environment for international business
 * by unifying the regulation within the EU.
 *
 * This set of utilities is intended to enable opt in/out functionality in the PostHog JS SDK.
 * These functions are used internally by the SDK and are not intended to be publicly exposed.
 */
import { GDPROptions } from './types';
import { PostHog } from './posthog-core';
/**
 * Opt the user in to data capturing and cookies/localstorage for the given token
 * @param {string} token - PostHog project capturing token
 * @param {Object} [options]
 * @param {captureFunction} [options.capture] - function used for capturing a PostHog event to record the opt-in action
 * @param {string} [options.captureEventName] - event name to be used for capturing the opt-in action
 * @param {Object} [options.captureProperties] - set of properties to be captured along with the opt-in action
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__ph_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-in cookie expires
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-in cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-in cookie is set as secure or not
 */
export declare function optIn(token: string, options: GDPROptions): void;
/**
 * Opt the user out of data capturing and cookies/localstorage for the given token
 * @param {string} token - PostHog project capturing token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__ph_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-out cookie expires
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-out cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-out cookie is set as secure or not
 */
export declare function optOut(token: string, options: GDPROptions): void;
/**
 * Check whether the user has opted in to data capturing and cookies/localstorage for the given token
 * @param {string} token - PostHog project capturing token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__ph_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} whether the user has opted in to the given opt type
 */
export declare function hasOptedIn(token: string, options: GDPROptions): boolean;
/**
 * Check whether the user has opted out of data capturing and cookies/localstorage for the given token
 * @param {string} token - PostHog project capturing token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__ph_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {boolean} [options.respectDnt] - flag to take browser DNT setting into account
 * @returns {boolean} whether the user has opted out of the given opt type
 */
export declare function hasOptedOut(token: string, options: Partial<GDPROptions>): boolean;
/**
 * Clear the user's opt in/out status of data capturing and cookies/localstorage for the given token
 * @param {string} token - PostHog project capturing token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__ph_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-in cookie expires
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-in cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-in cookie is set as secure or not
 */
export declare function clearOptInOut(token: string, options: GDPROptions): void;
export declare function userOptedOut(posthog: PostHog, silenceErrors: boolean | undefined): boolean;
/**
 * Wrap a method with a check for whether the user is opted out of data capturing and cookies/localstorage for the given token
 * If the user has opted out, return early instead of executing the method.
 * If a callback argument was provided, execute it passing the 0 error code.
 * @param {PostHog} posthog - the posthog instance
 * @param {function} method - wrapped method to be executed if the user has not opted out
 * @param silenceErrors
 * @returns {*} the result of executing method OR undefined if the user has opted out
 */
export declare function addOptOutCheck<M extends (...args: any[]) => any = (...args: any[]) => any>(posthog: PostHog, method: M, silenceErrors?: boolean): M;
