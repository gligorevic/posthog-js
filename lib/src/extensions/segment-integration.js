export var createSegmentIntegration = function (posthog) {
    var enrichEvent = function (ctx, eventName) {
        if (!ctx.event.userId && ctx.event.anonymousId !== posthog.get_distinct_id()) {
            // This is our only way of detecting that segment's analytics.reset() has been called so we also call it
            posthog.reset();
        }
        if (ctx.event.userId && ctx.event.userId !== posthog.get_distinct_id()) {
            posthog.register({
                distinct_id: ctx.event.userId,
            });
            posthog.reloadFeatureFlags();
        }
        var additionalProperties = posthog._calculate_event_properties(eventName, ctx.event.properties);
        ctx.event.properties = Object.assign({}, additionalProperties, ctx.event.properties);
        return ctx;
    };
    return {
        name: 'PostHog JS',
        type: 'enrichment',
        version: '1.0.0',
        isLoaded: function () { return true; },
        load: function () { return Promise.resolve(); },
        track: function (ctx) { return enrichEvent(ctx, ctx.event.event); },
        page: function (ctx) { return enrichEvent(ctx, '$pageview'); },
        identify: function (ctx) { return enrichEvent(ctx, '$identify'); },
        screen: function (ctx) { return enrichEvent(ctx, '$screen'); },
    };
};
//# sourceMappingURL=segment-integration.js.map