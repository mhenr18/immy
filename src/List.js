
// a List either owns a buffer and has the data, or has a reference to another
// list and a patch that can be applied to that list to get at this list's data

// list patches
var LIST_PATCH_NONE = -1;
var LIST_PATCH_POP = 0;
var LIST_PATCH_PUSH = 1;

// performs a patch on a list so that it will have a buffer. the patch source is
// assumed to have a buffer already. the patch will result in the list's patch
// source now using the list as a source, and the list won't need a patch

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
    }
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

module.exports = List;
