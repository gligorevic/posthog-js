export declare const LZString: {
    compressToBase64: (input: null | string) => string;
    decompressFromBase64: (input: string | null) => string | null;
    compressToUTF16: (input: string | null) => string | null;
    decompressFromUTF16: (compressed: string | null) => string | null;
    compressToUint8Array: (uncompressed: string | null) => Uint8Array;
    decompressFromUint8Array: (compressed: Uint8Array) => string | null;
    compressToEncodedURIComponent: (input: string | null) => string | null;
    decompressFromEncodedURIComponent: (input: string | null) => string | null;
    compress: (uncompressed: string | null) => string;
    _compress: (uncompressed: string | null, bitsPerChar: number, getCharFromInt: (number: number) => string) => string;
    decompress: (compressed: string | null) => string | null;
    _decompress: (length: number, resetValue: number, getNextValue: (index: number) => number) => string | null;
};
