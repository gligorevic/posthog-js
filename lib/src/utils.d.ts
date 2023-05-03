import { Breaker, EventHandler, Properties } from './types';
declare const win: Window & typeof globalThis;
declare const document: Document;
declare const userAgent: string;
declare const logger: {
    /** @type {function(...*)} */
    log: (...args: any[]) => void;
    /** @type {function(...*)} */
    error: (..._args: any[]) => void;
    /** @type {function(...*)} */
    critical: (..._args: any[]) => void;
};
export declare const _trim: (str: string) => string;
export declare const _bind_instance_methods: (obj: Record<string, any>) => void;
/**
 * @param {*=} obj
 * @param {function(...*)=} iterator
 * @param {Object=} thisArg
 */
export declare function _each(obj: any, iterator: (value: any, key: any) => void | Breaker, thisArg?: any): void;
export declare function _eachArray<E = any>(obj: E[] | null | undefined, iterator: (value: E, key: number) => void | Breaker, thisArg?: any): void;
export declare const _extend: (obj: Record<string, any>, ...args: Record<string, any>[]) => Record<string, any>;
export declare const _isArray: (arg: any) => arg is any[];
export declare const _isFunction: (f: any) => f is (...args: any[]) => any;
export declare const _include: (obj: null | string | Array<any> | Record<string, any>, target: any) => boolean | Breaker;
export declare function _includes<T = any>(str: T[] | string, needle: T): boolean;
/**
 * Object.entries() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
 */
export declare function _entries<T = any>(obj: Record<string, T>): [string, T][];
export declare const _isObject: (obj: any) => obj is Record<string, any>;
export declare const _isEmptyObject: (obj: any) => obj is Record<string, any>;
export declare const _isUndefined: (obj: any) => obj is undefined;
export declare const _isString: (obj: any) => obj is string;
export declare const _isDate: (obj: any) => obj is Date;
export declare const _isNumber: (obj: any) => obj is number;
export declare const _encodeDates: (obj: Properties) => Properties;
export declare const _timestamp: () => number;
export declare const _formatDate: (d: Date) => string;
export declare const _safewrap: <F extends (...args: any[]) => any = (...args: any[]) => any>(f: F) => F;
export declare const _safewrap_class: (klass: Function, functions: string[]) => void;
export declare const _safewrap_instance_methods: (obj: Record<string, any>) => void;
export declare const _strip_empty_properties: (p: Properties) => Properties;
export declare function _copyAndTruncateStrings<T extends Record<string, any> = Record<string, any>>(object: T, maxStringLength: number | null): T;
export declare function _base64Encode(data: null): null;
export declare function _base64Encode(data: undefined): undefined;
export declare function _base64Encode(data: string): string;
export declare const _utf8Encode: (string: string) => string;
export declare const _UUID: () => string;
export declare const _isBlockedUA: (ua: string) => boolean;
/**
 * @param {Object=} formdata
 * @param {string=} arg_separator
 */
export declare const _HTTPBuildQuery: (formdata: Record<string, any>, arg_separator?: string) => string;
export declare const _getQueryParam: (url: string, param: string) => string;
export declare const _getHashParam: (hash: string, param: string) => string | null;
export declare const _register_event: (element: Element | Window | Document | Node, type: string, handler: EventHandler, oldSchool?: boolean, useCapture?: boolean) => void;
export declare const isLocalhost: () => boolean;
export declare function loadScript(scriptUrlToLoad: string, callback: (error?: string | Event, event?: Event) => void): void;
export declare const _info: {
    campaignParams: (customParams?: string[]) => Record<string, any>;
    searchEngine: () => string | null;
    searchInfo: () => Record<string, any>;
    /**
     * This function detects which browser is running this script.
     * The order of the checks are important since many user agents
     * include key words used in later checks.
     */
    browser: (user_agent: string, vendor: string, opera?: any) => string;
    /**
     * This function detects which browser version is running this script,
     * parsing major and minor version (e.g., 42.1). User agent strings from:
     * http://www.useragentstring.com/pages/useragentstring.php
     */
    browserVersion: (userAgent: string, vendor: string, opera: string) => number | null;
    browserLanguage: () => string;
    os: () => string;
    device: (user_agent: string) => string;
    deviceType: (user_agent: string) => string;
    referrer: () => string;
    referringDomain: () => string;
    properties: () => Properties;
    people_properties: () => Properties;
};
export { win as window, userAgent, logger, document };
