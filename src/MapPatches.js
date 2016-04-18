
/********************************************************************************
 *
 *   MapPatches.Set (implements the MapPatch interface)
 *   (implemented as SetPatch to avoid name collisions, and exported as Set)
 *
 *   Sets the given key from the old value to the new value. This is a primitive
 *   operation. Use a value of undefined to delete the value.
 *
 *   Examples:
 *
 *   Set('foo', undefined, 'bar'):
 *       { a: 'b', 1: 2 } -> { a: 'b', 1:2, 'foo', 'bar' }
 *
 *   Set('a', 'b', 'c'):
 *       { a: 'b', 1: 2 } -> { a: 'c', 1:2 }
 *
 *   Set(1, 2, undefined):
 *       { a: 'b', 1: 2 } -> { a: 'c' }
 *
 ********************************************************************************/

function SetPatch(key, oldValue, newValue) {
    this.key = key;
    this.oldValue = oldValue;
    this.newValue = newValue;
};

SetPatch.prototype.apply = function (map) {
    if (this.newValue === undefined) {
        map.delete(this.key);
    } else {
        map.set(this.key, this.newValue);
    }
};

SetPatch.prototype.inverse = function () {
    return new SetPatch(this.key, this.newValue, this.oldValue);
};

SetPatch.prototype.toPrimitives = function () {
    return [ this ];
};

SetPatch.prototype.forEachPrimitive = function (cb) {
    cb(this);
};

exports.Set = SetPatch;

/********************************************************************************
 *
 *   MapPatches.Sequence (implements the MapPatch interface)
 *
 *   Performs a sequence of patches. This patch is not a primitive operation.
 *   Sequence patches allow multiple operations to be encapsulated into a single
 *   patch.
 *
 *   The patches are always performed in order. (Which means it's possible for
 *   patches within the sequence to cancel themselves out)
 *
 *   Examples:
 *
 *   Sequence([Set('a', Set.NOTHING, 'b'), Set('foo', 'bar', 'baz')]):
 *       { foo: 'bar' } -> { foo: 'baz', a: 'b' }
 *
 ********************************************************************************/

function Sequence(patches) {
    this.patches = patches;
};

Sequence.prototype.apply = function (map) {
    var i;

    for (i = 0; i < this.patches.length; ++i) {
        this.patches[i].apply(map);
    }
};

Sequence.prototype.inverse = function () {
    var inverted = [];
    var i;

    for (i = this.patches.length - 1; i >= 0; --i) {
        inverted.push(this.patches[i].inverse());
    }

    return new Sequence(inverted);
};

Sequence.prototype.toPrimitives = function () {
    var primitives = [];
    var i;

    for (i = 0; i < this.patches.length; ++i) {
        Array.prototype.push.apply(primitives, this.patches[i].toPrimitives());
    }

    return primitives;
};

Sequence.prototype.forEachPrimitive = function (cb) {
    var i;

    for (i = 0; i < this.patches.length; ++i) {
        this.patches[i].forEachPrimitive(cb);
    }
};

exports.Sequence = Sequence;
