var CaptureMetrics = /** @class */ (function () {
    function CaptureMetrics(enabled) {
        this.enabled = enabled;
        this.metrics = {};
    }
    CaptureMetrics.prototype.incr = function (key, by) {
        if (by === void 0) { by = 1; }
        if (this.enabled) {
            key = "phjs-".concat(key);
            this.metrics[key] = (this.metrics[key] || 0) + by;
        }
    };
    CaptureMetrics.prototype.decr = function (key) {
        if (this.enabled) {
            key = "phjs-".concat(key);
            this.metrics[key] = (this.metrics[key] || 0) - 1;
        }
    };
    return CaptureMetrics;
}());
export { CaptureMetrics };
//# sourceMappingURL=capture-metrics.js.map