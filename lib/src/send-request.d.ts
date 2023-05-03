import { PostData, XHROptions, XHRParams } from './types';
export declare const addParamsToURL: (url: string, urlQueryArgs: Record<string, any> | undefined, parameterOptions: {
    ip?: boolean;
}) => string;
export declare const encodePostData: (data: PostData | Uint8Array, options: Partial<XHROptions>) => string | BlobPart | null;
export declare const xhr: ({ url, data, headers, options, captureMetrics, callback, retriesPerformedSoFar, retryQueue, onXHRError, timeout, }: XHRParams) => void;
