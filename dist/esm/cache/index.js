export class Cache {
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
//# sourceMappingURL=index.js.map