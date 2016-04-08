
/********************************************************************************
 *
 *   ListPatches.Add (implements the ListPatch interface)
 *
 *   Adds the given item at the given index. The index must be in the closed range
 *   [0, array.length], noting that an index of the array's length will append to
 *   the array. This patch is a primitive operation.
 *
 *   Examples:
 *
 *   Add(2, 'foo'):
 *       ['abc', 'def', 'ghi', 'jkl'] -> ['abc', 'def', 'foo', 'ghi', 'jkl']
 *
 *   Add(0, 'bar'):
 *       ['abc', 'def', 'ghi', 'jkl'] -> ['bar', 'abc', 'def', 'foo', 'ghi']
 *
 *   Add(4, 'baz'):
 *       ['abc', 'def', 'ghi', 'jkl'] -> ['abc', 'def', 'ghi', 'jkl', 'baz']
 *
 ********************************************************************************/

function Add(index, value) {
    this.index = index;
    this.value = value;
};

Add.prototype.apply = function (array) {
    array.splice(this.index, 0, this.value);
};

Add.prototype.inverse = function () {
    return new Remove(this.index, this.value);
};

Add.prototype.toPrimitives = function () {
    return [ this ];
};

exports.Add = Add;


/********************************************************************************
 *
 *   ListPatches.Remove (implements the ListPatch interface)
 *
 *   Removes the given item from the given index. The index must be in the closed
 *   range [0, array.length - 1]. This patch is a primitive operation.
 *
 *   It's a reasonable question to ask why this patch needs to store the value
 *   that it's removing. After all, Array.splice doesn't need to know the values
 *   it's removing and works perfectly fine! The reason is that the ListPatch
 *   interface requires patches to have an invert() method, and it's impossible to
 *   consruct the corresponding Add() patch without what knowing what value to
 *   add.
 *
 *   Examples:
 *
 *   Remove(2, 'foo'):
 *       ['abc', 'def', 'foo', 'ghi', 'jkl'] -> ['abc', 'def', 'ghi', 'jkl']
 *
 *   Remove(0, 'bar'):
 *       ['bar', 'abc', 'def', 'foo', 'ghi'] -> ['abc', 'def', 'ghi', 'jkl']
 *
 *   Remove(4, 'baz'):
 *       ['abc', 'def', 'ghi', 'jkl', 'baz'] -> ['abc', 'def', 'ghi', 'jkl']
 *
 ********************************************************************************/

function Remove(index, value) {
    this.index = index;
    this.value = value;
};

Remove.prototype.apply = function (array) {
    array.splice(this.index, 1);
};

Remove.prototype.inverse = function () {
    return new Add(this.index, this.value);
};

Remove.prototype.toPrimitives = function () {
    return [ this ];
};

exports.Remove = Remove;


/********************************************************************************
 *
 *   ListPatches.Sequence (implements the ListPatch interface)
 *
 *   Performs a sequence of patches. This patch is not a primitive operation.
 *   Sequence patches allow things like splices to be encapsulated into a single
 *   patch, instead of needing to store individual patches for each add or remove.
 *
 *   The patches are always performed in order.
 *
 *   Examples:
 *
 *   Sequence([Add(2, 'foo'), Add(2, 'bar'), Remove(1, 'def')]):
 *       ['abc', 'def', 'ghi', 'jkl'] -> ['abc', 'bar', 'foo', 'ghi', 'jkl']
 *
 ********************************************************************************/

function Sequence(patches) {
    this.patches = patches;
};

Sequence.prototype.apply = function (buffer) {
    var i;

    for (i = 0; i < this.patches.length; ++i) {
        this.patches[i].apply(buffer);
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

exports.Sequence = Sequence;
