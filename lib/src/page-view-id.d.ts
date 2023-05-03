export declare class PageViewIdManager {
    _pageViewId: string | undefined;
    _seenFirstPageView: boolean;
    onPageview(): void;
    getPageViewId(): string;
}
