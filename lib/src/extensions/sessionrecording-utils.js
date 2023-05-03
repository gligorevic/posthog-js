var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
export var replacementImageURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNOCAwSDE2TDAgMTZWOEw4IDBaIiBmaWxsPSIjMkQyRDJEIi8+CjxwYXRoIGQ9Ik0xNiA4VjE2SDhMMTYgOFoiIGZpbGw9IiMyRDJEMkQiLz4KPC9zdmc+Cg==';
export var FULL_SNAPSHOT_EVENT_TYPE = 2;
export var META_EVENT_TYPE = 4;
export var INCREMENTAL_SNAPSHOT_EVENT_TYPE = 3;
export var PLUGIN_EVENT_TYPE = 6;
export var MUTATION_SOURCE_TYPE = 0;
/*
 * Check whether a data payload is nearing 5mb. If it is, it checks the data for
 * data URIs (the likely culprit for large payloads). If it finds data URIs, it either replaces
 * it with a generic image (if it's an image) or removes it.
 * @data {object} the rr-web data object
 * @returns {object} the rr-web data object with data uris filtered out
 */
export function filterDataURLsFromLargeDataObjects(data) {
    var e_1, _a;
    if (data && typeof data === 'object') {
        var stringifiedData = JSON.stringify(data);
        // String length of 5000000 is an approximation of 5mb
        // Note: with compression, this limit may be able to be increased
        // but we're assuming most of the size is from a data uri which
        // is unlikely to be compressed further
        if (stringifiedData.length > 5000000) {
            // Regex that matches the pattern for a dataURI with the shape 'data:{mime type};{encoding},{data}'. It:
            // 1) Checks if the pattern starts with 'data:' (potentially, not at the start of the string)
            // 2) Extracts the mime type of the data uri in the first group
            // 3) Determines when the data URI ends.Depending on if it's used in the src tag or css, it can end with a ) or "
            var dataURIRegex = /data:([\w\/\-\.]+);(\w+),([^)"]*)/gim;
            var matches = stringifiedData.matchAll(dataURIRegex);
            try {
                for (var matches_1 = __values(matches), matches_1_1 = matches_1.next(); !matches_1_1.done; matches_1_1 = matches_1.next()) {
                    var match = matches_1_1.value;
                    if (match[1].toLocaleLowerCase().slice(0, 6) === 'image/') {
                        stringifiedData = stringifiedData.replace(match[0], replacementImageURI);
                    }
                    else {
                        stringifiedData = stringifiedData.replace(match[0], '');
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (matches_1_1 && !matches_1_1.done && (_a = matches_1.return)) _a.call(matches_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return JSON.parse(stringifiedData);
    }
    return data;
}
export var CONSOLE_LOG_PLUGIN_NAME = 'rrweb/console@1'; // The name of the rr-web plugin that emits console logs
// Console logs can be really large. This function truncates large logs
// It's a simple function that just truncates long strings.
// TODO: Ideally this function would have better handling of objects + lists,
// so they could still be rendered in a pretty way after truncation.
export function truncateLargeConsoleLogs(event) {
    var MAX_STRING_SIZE = 2000; // Maximum number of characters allowed in a string
    var MAX_STRINGS_PER_LOG = 10; // A log can consist of multiple strings (e.g. consol.log('string1', 'string2'))
    if (event &&
        typeof event === 'object' &&
        event.type === PLUGIN_EVENT_TYPE &&
        typeof event.data === 'object' &&
        event.data.plugin === CONSOLE_LOG_PLUGIN_NAME) {
        // Note: event.data.payload.payload comes from rr-web, and is an array of strings
        if (event.data.payload.payload.length > MAX_STRINGS_PER_LOG) {
            event.data.payload.payload = event.data.payload.payload.slice(0, MAX_STRINGS_PER_LOG);
            event.data.payload.payload.push('...[truncated]');
        }
        var updatedPayload = [];
        for (var i = 0; i < event.data.payload.payload.length; i++) {
            if (event.data.payload.payload[i] && // Value can be null
                event.data.payload.payload[i].length > MAX_STRING_SIZE) {
                updatedPayload.push(event.data.payload.payload[i].slice(0, MAX_STRING_SIZE) + '...[truncated]');
            }
            else {
                updatedPayload.push(event.data.payload.payload[i]);
            }
        }
        event.data.payload.payload = updatedPayload;
        return event;
    }
    return event;
}
//# sourceMappingURL=sessionrecording-utils.js.map