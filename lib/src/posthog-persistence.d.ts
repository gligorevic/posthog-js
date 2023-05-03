import { PersistentStore, PostHogConfig, Properties } from './types';
export declare const PEOPLE_DISTINCT_ID_KEY = "$people_distinct_id";
export declare const ALIAS_ID_KEY = "__alias";
export declare const CAMPAIGN_IDS_KEY = "__cmpns";
export declare const EVENT_TIMERS_KEY = "__timers";
export declare const AUTOCAPTURE_DISABLED_SERVER_SIDE = "$autocapture_disabled_server_side";
export declare const SESSION_RECORDING_ENABLED_SERVER_SIDE = "$session_recording_enabled_server_side";
export declare const CONSOLE_LOG_RECORDING_ENABLED_SERVER_SIDE = "$console_log_recording_enabled_server_side";
export declare const SESSION_RECORDING_RECORDER_VERSION_SERVER_SIDE = "$session_recording_recorder_version_server_side";
export declare const SESSION_ID = "$sesid";
export declare const ENABLED_FEATURE_FLAGS = "$enabled_feature_flags";
export declare const PERSISTENCE_EARLY_ACCESS_FEATURES = "$early_access_features";
export declare const STORED_PERSON_PROPERTIES_KEY = "$stored_person_properties";
export declare const STORED_GROUP_PROPERTIES_KEY = "$stored_group_properties";
export declare const RESERVED_PROPERTIES: string[];
/**
 * PostHog Persistence Object
 * @constructor
 */
export declare class PostHogPersistence {
    props: Properties;
    storage: PersistentStore;
    campaign_params_saved: boolean;
    custom_campaign_params: string[];
    name: string;
    disabled: boolean | undefined;
    secure: boolean | undefined;
    expire_days: number | undefined;
    default_expiry: number | undefined;
    cross_subdomain: boolean | undefined;
    user_state: 'anonymous' | 'identified';
    constructor(config: PostHogConfig);
    properties(): Properties;
    load(): void;
    /**
     * NOTE: Saving frequently causes issues with Recordings and Consent Management Platform (CMP) tools which
     * observe cookie changes, and modify their UI, often causing infinite loops.
     * As such callers of this should ideally check that the data has changed beforehand
     */
    save(): void;
    remove(): void;
    clear(): void;
    /**
     * @param {Object} props
     * @param {*=} default_value
     * @param {number=} days
     */
    register_once(props: Properties, default_value: any, days?: number): boolean;
    /**
     * @param {Object} props
     * @param {number=} days
     */
    register(props: Properties, days?: number): boolean;
    unregister(prop: string): void;
    update_campaign_params(): void;
    update_search_keyword(): void;
    update_referrer_info(): void;
    get_referrer_info(): Properties;
    safe_merge(props: Properties): Properties;
    update_config(config: PostHogConfig): void;
    set_disabled(disabled: boolean): void;
    set_cross_subdomain(cross_subdomain: boolean): void;
    get_cross_subdomain(): boolean;
    set_secure(secure: boolean): void;
    set_event_timer(event_name: string, timestamp: number): void;
    remove_event_timer(event_name: string): number;
    get_user_state(): 'anonymous' | 'identified';
    set_user_state(state: 'anonymous' | 'identified'): void;
}
