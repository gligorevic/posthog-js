import { version } from 'rrweb/package.json';
// Same as loader-globals.ts except includes rrweb scripts.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rrwebRecord from 'rrweb/es/rrweb/packages/rrweb/src/record';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getRecordConsolePlugin } from 'rrweb/es/rrweb/packages/rrweb/src/plugins/console/record';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var win = typeof window !== 'undefined' ? window : {};
win.rrweb = { record: rrwebRecord, version: 'v1', rrwebVersion: version };
win.rrwebConsoleRecord = { getRecordConsolePlugin: getRecordConsolePlugin };
export default rrwebRecord;
//# sourceMappingURL=loader-recorder.js.map