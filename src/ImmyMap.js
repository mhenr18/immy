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
  if (this.map) {
    return
  }

  if (!this.patchSource) {
    // no patch source and no map means that we're an empty list
    this.map = new Map()
    return
  }

  // first traverse out along the patch source chain to find a starting point
  // to apply patches from. because we don't store backreferences we need to
  // maintain a stack of targets to apply patches to
  var source = this.patchSource
  var targets = [this]
  while (source.patchSource) {
    targets.push(source)
    source = source.patchSource
  }

  // now work our way back down the stack and apply patches
  while (targets.length > 0) {
    var target = targets.pop()

    target.patch.apply(source.map);
    source.patchSource = target;
    source.patch = target.patch.inverse();
    target.map = source.map;
    source.map = null;
    target.patchSource = null;

    source = target
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
