
// a List either owns a buffer and has the data, or has a reference to another
// list and a patch that can be applied to that list to get at this list's data

// list patches
var LIST_PATCH_NONE = -1;
var LIST_PATCH_POP = 0;
var LIST_PATCH_PUSH = 1;
var LIST_PATCH_SET = 2;
var LIST_PATCH_SPLICE = 3;

// performs a patch on a list so that it will have a buffer. the patch source is
// assumed to have a buffer already. the patch will result in the list's patch
// source now using the list as a source, and the list won't need a patch.
//
// benchmarking showed that it was *much* faster to save a patch type + data
// rather than using a callback, so we're taking this approach. it's not as
// elegant code-wise but we'll do anything for speed

var patchFunctions = [
    // LIST_PATCH_POP
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchData = target.buffer.pop();
        target.patchType = LIST_PATCH_PUSH;

        list.buffer = target.buffer;
        target.buffer = null;

        list.patchType = LIST_PATCH_NONE;
    },

    // LIST_PATCH_PUSH
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchType = LIST_PATCH_POP;

        list.buffer = target.buffer;
        target.buffer = null;
        list.buffer.push(list.patchData);

        list.patchData = null;
        list.patchType = LIST_PATCH_NONE;
    },

    // LIST_PATCH_SET
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchType = LIST_PATCH_SET;
        target.patchData = [list.patchData[0], target.buffer[list.patchData[0]]];

        list.buffer = target.buffer;
        target.buffer = null;
        list.buffer[list.patchData[0]] = list.patchData[1];

        list.patchData = null;
        list.patchType = LIST_PATCH_NONE;
    },

    // LIST_PATCH_SPLICE
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchType = LIST_PATCH_SPLICE;

        var deletedItems = target.buffer.splice.apply(target.buffer, list.patchData);
        target.patchData = [list.patchData[0], list.patchData.length - 2].concat(deletedItems);

        list.buffer = target.buffer;
        target.buffer = null;

        list.patchData = null;
        list.patchType = LIST_PATCH_NONE;
    },
];


function List(initBuffer) {
    if (initBuffer != null) {
        this.buffer = initBuffer.slice();
    } else {
        this.buffer = null;
    }

    this.patchSource = null;
    this.patchType = LIST_PATCH_NONE;
    this.patchData = null;
}

// ensures that the list has a buffer that can be used.
List.prototype.__getBuffer = function () {
    if (!this.buffer) {
        if (!this.patchSource) {
            // no patch source and no buffer means that we're an empty list
            this.buffer = [];
        } else {
            this.patchSource.__getBuffer();
            patchFunctions[this.patchType](this);
        }
    }
};

List.prototype.push = function (value) {
    this.__getBuffer();

    var newList = new List();

    this.patchSource = newList;
    this.patchType = LIST_PATCH_POP;
    this.patchData = null;

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer.push(value);

    return newList;
};

List.prototype.pop = function () {
    this.__getBuffer();

    var newList = new List();

    this.patchSource = newList;
    this.patchType = LIST_PATCH_PUSH;
    this.patchData = this.buffer.pop();

    newList.buffer = this.buffer;
    this.buffer = null;

    return newList;
};

List.prototype.size = function () {
    // TODO: make this fast
    this.__getBuffer();
    return this.buffer.length;
};

List.prototype.get = function (index) {
    this.__getBuffer();
    return this.buffer[index];
};

List.prototype.set = function (index, newValue) {
    this.__getBuffer();

    var newList = new List();

    this.patchSource = newList;
    this.patchType = LIST_PATCH_SET;
    this.patchData = [index, this.buffer[index]];

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer[index] = newValue;

    return newList;
};

List.prototype.forEach = function (fn) {
    this.__getBuffer();
    this.buffer.forEach(fn);
};

List.prototype.findIndex = function (pred) {
    this.__getBuffer();
    return this.buffer.findIndex(pred);
};

// doesn't need a __getBuffer call because set and get do that for us
List.prototype.withMutation = function (index, fn) {
    return this.set(index, fn(this.get(index)));
};

List.prototype.slice = function (begin, end) {
    // begin === undefined means begin is assumed to be zero, which means a full
    // copy. immutable lists don't need copying so we don't need to bother with
    // getting our buffer
    if (begin === undefined || (begin === 0 && end === undefined)) {
        return this;
    }

    this.__getBuffer();

    // note, no patch here because we keep our buffer and the slice has its own
    var sliced = new List();
    sliced.buffer = this.buffer.slice(begin, end);

    return sliced;
};

List.prototype.splice = function (start, deleteCount) { // [, item1, item2, ...]
    if (start === 0 && deleteCount === 0 && arguments.length === 2) {
        return this;
    }

    var deletedItems = this.buffer.splice.apply(this.buffer, arguments);

    var newList = new List();
    this.patchSource = newList;
    this.patchType = LIST_PATCH_SPLICE;
    this.patchData = [start, arguments.length - 2].concat(deletedItems);

    newList.buffer = this.buffer;
    this.buffer = null;

    return newList;
};

module.exports = List;
