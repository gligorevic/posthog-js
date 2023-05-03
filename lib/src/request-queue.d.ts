import { RequestQueueScaffold } from './base-request-queue';
import { CaptureMetrics } from './capture-metrics';
import { Properties, QueuedRequestData, XHROptions } from './types';
export declare class RequestQueue extends RequestQueueScaffold {
    captureMetrics: CaptureMetrics;
    handlePollRequest: (url: string, data: Properties, options?: XHROptions) => void;
    constructor(captureMetrics: CaptureMetrics, handlePollRequest: (url: string, data: Properties, options?: XHROptions) => void, pollInterval?: number);
    enqueue(url: string, data: Properties, options: XHROptions): void;
    poll(): void;
    updateUnloadMetrics(): void;
    unload(): void;
    formatQueue(): Record<string, QueuedRequestData>;
}
