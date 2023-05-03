export declare class CaptureMetrics {
    enabled: boolean;
    metrics: Record<string, number>;
    constructor(enabled: boolean);
    incr(key: string, by?: number): void;
    decr(key: string): void;
}
