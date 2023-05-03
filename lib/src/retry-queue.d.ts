import { RequestQueueScaffold } from './base-request-queue';
import { CaptureMetrics } from './capture-metrics';
import { QueuedRequestData, RetryQueueElement } from './types';
export declare class RetryQueue extends RequestQueueScaffold {
    captureMetrics: CaptureMetrics;
    queue: RetryQueueElement[];
    isPolling: boolean;
    areWeOnline: boolean;
    onXHRError: (failedRequest: XMLHttpRequest) => void;
    constructor(captureMetrics: CaptureMetrics, onXHRError: (failedRequest: XMLHttpRequest) => void);
    enqueue(requestData: QueuedRequestData): void;
    poll(): void;
    flush(): void;
    unload(): void;
    _executeXhrRequest({ url, data, options, headers, callback, retriesPerformedSoFar }: QueuedRequestData): void;
    _handleWeAreNowOnline(): void;
}
