import { version } from '../package.json';
// overriden in posthog-core,
// e.g.     Config.DEBUG = Config.DEBUG || instance.get_config('debug')
var Config = {
    DEBUG: false,
    LIB_VERSION: version,
};
export default Config;
//# sourceMappingURL=config.js.map