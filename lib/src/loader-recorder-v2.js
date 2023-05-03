import { version } from 'rrweb2/package.json';
// Same as loader-globals.ts except includes rrweb2 scripts.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rrwebRecord from 'rrweb2/es/rrweb/packages/rrweb/src/record';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getRecordConsolePlugin } from 'rrweb2/es/rrweb/packages/rrweb/src/plugins/console/record';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var win = typeof window !== 'undefined' ? window : {};
win.rrweb = { record: rrwebRecord, version: 'v2', rrwebVersion: version };
win.rrwebConsoleRecord = { getRecordConsolePlugin: getRecordConsolePlugin };
export default rrwebRecord;
//# sourceMappingURL=loader-recorder-v2.js.map