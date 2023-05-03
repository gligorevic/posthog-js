import { _UUID } from './utils';
var PageViewIdManager = /** @class */ (function () {
    function PageViewIdManager() {
        this._seenFirstPageView = false;
    }
    PageViewIdManager.prototype.onPageview = function () {
        // As the first $pageview event may come after a different event,
        // we only reset the ID _after_ the second $pageview event.
        if (this._seenFirstPageView) {
            this._pageViewId = _UUID();
        }
        this._seenFirstPageView = true;
    };
    PageViewIdManager.prototype.getPageViewId = function () {
        if (!this._pageViewId) {
            this._pageViewId = _UUID();
        }
        return this._pageViewId;
    };
    return PageViewIdManager;
}());
export { PageViewIdManager };
//# sourceMappingURL=page-view-id.js.map