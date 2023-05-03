import { PostHogPersistence } from './posthog-persistence';
import { PostHogConfig } from './types';
export declare class SessionIdManager {
    config: Partial<PostHogConfig>;
    persistence: PostHogPersistence;
    _windowId: string | null | undefined;
    _sessionId: string | null | undefined;
    window_id_storage_key: string;
    primary_window_exists_storage_key: string;
    _sessionStartTimestamp: number | null;
    _sessionActivityTimestamp: number | null;
    constructor(config: Partial<PostHogConfig>, persistence: PostHogPersistence);
    _canUseSessionStorage(): boolean;
    _setWindowId(windowId: string): void;
    _getWindowId(): string | null;
    _setSessionId(sessionId: string | null, sessionActivityTimestamp: number | null, sessionStartTimestamp: number | null): void;
    _getSessionId(): [number, string, number];
    resetSessionId(): void;
    _listenToReloadWindow(): void;
    checkAndGetSessionAndWindowId(readOnly?: boolean, _timestamp?: number | null): {
        sessionId: string;
        windowId: string;
    };
}
