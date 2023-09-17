"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor() {
        this._obj = {};
    }
    static ref() {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }
    set(key, value) {
        this._obj[key] = value;
    }
    get(key) {
        return this._obj[key];
    }
}
exports.Cache = Cache;
//# sourceMappingURL=index.js.map