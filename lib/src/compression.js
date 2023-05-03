var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { LZString } from './lz-string';
import { gzipSync, strToU8 } from 'fflate';
import { _base64Encode } from './utils';
import { Compression } from './types';
export function decideCompression(compressionSupport) {
    if (compressionSupport[Compression.GZipJS]) {
        return Compression.GZipJS;
    }
    else if (compressionSupport[Compression.LZ64]) {
        return Compression.LZ64;
    }
    else {
        return Compression.Base64;
    }
}
export function compressData(compression, jsonData, options) {
    if (compression === Compression.LZ64) {
        return [{ data: LZString.compressToBase64(jsonData), compression: Compression.LZ64 }, options];
    }
    else if (compression === Compression.GZipJS) {
        // :TRICKY: This returns an UInt8Array. We don't encode this to a string - returning a blob will do this for us.
        return [
            gzipSync(strToU8(jsonData), { mtime: 0 }),
            __assign(__assign({}, options), { blob: true, urlQueryArgs: { compression: Compression.GZipJS } }),
        ];
    }
    else {
        return [{ data: _base64Encode(jsonData) }, options];
    }
}
//# sourceMappingURL=compression.js.map