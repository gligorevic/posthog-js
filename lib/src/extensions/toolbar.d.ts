import { PostHog } from '../posthog-core';
import { DecideResponse, ToolbarParams } from '../types';
export declare class Toolbar {
    instance: PostHog;
    constructor(instance: PostHog);
    afterDecideResponse(response: DecideResponse): void;
    /**
     * To load the toolbar, we need an access token and other state. That state comes from one of three places:
     * 1. In the URL hash params
     * 2. From session storage under the key `toolbarParams` if the toolbar was initialized on a previous page
     */
    maybeLoadToolbar(location?: Location, localStorage?: Storage | undefined, history?: History): boolean;
    loadToolbar(params?: ToolbarParams): boolean;
    /** @deprecated Use "loadToolbar" instead. */
    _loadEditor(params: ToolbarParams): boolean;
    /** @deprecated Use "maybeLoadToolbar" instead. */
    maybeLoadEditor(location?: Location, localStorage?: Storage | undefined, history?: History): boolean;
}
