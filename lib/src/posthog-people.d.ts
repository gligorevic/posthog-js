import { PostHogConfig, Properties, RequestCallback } from './types';
import { PostHog } from './posthog-core';
/**
 * PostHog People Object
 * @constructor
 */
declare class PostHogPeople {
    _posthog: PostHog;
    set: (prop: string | Properties, to?: string, callback?: RequestCallback) => void;
    set_once: (prop: string | Properties, to?: string, callback?: RequestCallback) => void;
    constructor(posthog: PostHog);
    toString(): string;
    _send_request(data: Properties, callback?: RequestCallback): Properties;
    _get_config<K extends keyof PostHogConfig>(conf_var: K): PostHogConfig[K];
    _is_reserved_property(prop: string): boolean;
    private set_action;
    private set_once_action;
    private apiActionParser;
}
export { PostHogPeople };
