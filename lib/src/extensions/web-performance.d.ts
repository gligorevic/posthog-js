import { PostHog } from '../posthog-core';
import { DecideResponse } from '../types';
export declare class WebPerformanceObserver {
    instance: PostHog;
    remoteEnabled: boolean | undefined;
    observer: PerformanceObserver | undefined;
    _forceAllowLocalhost: boolean;
    constructor(instance: PostHog);
    startObservingIfEnabled(): void;
    startObserving(): void;
    stopObserving(): void;
    isObserving(): boolean;
    isEnabled(): boolean;
    afterDecideResponse(response: DecideResponse): void;
    _capturePerformanceEvent(event: PerformanceEntry): void;
    /**
     * :TRICKY: Make sure we batch these requests, and don't truncate the strings.
     */
    private capturePerformanceEvent;
}
