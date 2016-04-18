var MapPatches = require('./MapPatches');

// We want to use a JS Map object, but also call ourselves a Map. To get 
// around this, we call this implementation ImmyMap, but export it from Immy
// as Immy.Map.
//
// Note that a key difference between this and "real" Maps is that undefined
// values aren't supported at all.

function ImmyMap(initMap) {
    if (initMap) {
        this.map = initMap;
    } else {
        this.map = null;
    }

    this.patchSource = null;
    this.patch = null;
    this.root = {};
}

ImmyMap.prototype.__getMap = function () {
    if (!this.map) {
        if (!this.patchSource) {
            // no patch source and no map means that we're an empty map
            this.map = new Map();
        } else {
            this.patchSource.__getMap();

            this.patch.apply(this.patchSource.map);

            this.patchSource.patchSource = this;
            this.patchSource.patch = this.patch.inverse();
            this.map = this.patchSource.map;
            this.patchSource.map = null;
            this.patchSource = null;
        }
    }
};

ImmyMap.prototype.get = function (key) {
    this.__getMap();
    return this.map.get(key);
};

ImmyMap.prototype.withKeySetToValue = function (key, value) {
    this.__getMap();

    var newMap = new ImmyMap();
    newMap.map = this.map;
    this.map = null;

    this.patchSource = newMap;
    this.patch = new MapPatches.Set(key, value, newMap.map.get(key));
    newMap.map.set(key, value);

    return newMap;
};

ImmyMap.prototype.withKeyDeleted = function (key) {
    this.__getMap();

    var newMap = new ImmyMap();
    newMap.map = this.map;
    this.map = null;

    this.patchSource = newMap;
    this.patch = new MapPatches.Set(key, undefined, newMap.get(key));
    newMap.map.delete(key);

    return newMap;
};

ImmyMap.prototype.forEach = function (cb) {
    this.__getMap();
    this.map.forEach(cb);
};

ImmyMap.prototype.size = function () {
    this.__getMap();
    return this.map.size;
};

ImmyMap.prototype.has = function (key) {
    this.__getMap();
    return this.map.has(key);
};

module.exports = ImmyMap;
