var ListPatches = require('./ListPatches');

// a List either owns a buffer and has the data, or has a reference to another
// list and a patch that can be applied to that list to get at this list's data



// performs a patch on a list so that it will have a buffer. the patch source is
// assumed to have a buffer already. the patch will result in the list's patch
// source now using the list as a source, and the list won't need a patch.
//
// benchmarking showed that it was *much* faster to save a patch type + data
// rather than using a callback, so we're taking this approach. it's not as
// elegant code-wise but we'll do anything for speed.

var patchFunctions = [
    // ListPatches.POP
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchData = target.buffer.pop();
        target.patchType = ListPatches.PUSH;

        list.buffer = target.buffer;
        target.buffer = null;

        list.patchType = ListPatches.NONE;
    },

    // ListPatches.PUSH
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchType = ListPatches.POP;

        list.buffer = target.buffer;
        target.buffer = null;
        list.buffer.push(list.patchData);

        list.patchData = null;
        list.patchType = ListPatches.NONE;
    },

    // ListPatches.SET
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchType = ListPatches.SET;
        target.patchData = [list.patchData[0], target.buffer[list.patchData[0]]];

        list.buffer = target.buffer;
        target.buffer = null;
        list.buffer[list.patchData[0]] = list.patchData[1];

        list.patchData = null;
        list.patchType = ListPatches.NONE;
    },

    // ListPatches.SPLICE
    function (list) {
        var target = list.patchSource;
        target.patchSource = list;
        target.patchType = ListPatches.SPLICE;

        var deletedItems = target.buffer.splice.apply(target.buffer, list.patchData);
        target.patchData = [list.patchData[0], list.patchData.length - 2].concat(deletedItems);

        list.buffer = target.buffer;
        target.buffer = null;

        list.patchData = null;
        list.patchType = ListPatches.NONE;
    },
];


function List(initBuffer) {
    if (initBuffer != null) {
        this.buffer = initBuffer.slice();
    } else {
        this.buffer = null;
    }

    this.patchSource = null;
    this.patchType = ListPatches.NONE;
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
    this.patchType = ListPatches.POP;
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
    this.patchType = ListPatches.PUSH;
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
    this.patchType = ListPatches.SET;
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
    this.patchType = ListPatches.SPLICE;
    this.patchData = [start, arguments.length - 2].concat(deletedItems);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.removedValues = deletedItems;

    return newList;
};

// List.compareTo() returns an array of patches which will take this list and make
// it equal to the otherList. i.e, if I have [a, b].compareTo([a, b, c]) then i'll
// get a patch that will add c. swapping the lists will result in a patch that
// would remove c.
//
// the returned patches won't always be minimal.

List.prototype.compareTo = function (otherList) {
    // TODO: make this efficient
    var other = otherList.slice();
    this.__getBuffer();

    return compareArrays(this.buffer, other.buffer);
};

// returns patches that will take the from array and make it become the to array.
// note: FROM AND TO ARE JUST JS ARRAYS, NOT IMMY LISTS.
function compareArrays(from, to) {
    // take the lame way out and return a "patch" that literally just removes
    // everything and then adds the entire contents of the "to" array using a
    // single splice.
    //
    // TODO: rewrite this!

    return [{
        type: ListPatches.SPLICE,
        data: [0, from.length].concat(to)
    }];
}


// the operationCallback is called every time an operation (add or remove) happens
// to the list while the patches are being applied, so that rather than parsing
// the patch list you can just be told what's been added and removed. sets are
// done as a remove of the existing item + an add of the new item.
//
// signature of this callback is (added: bool, index: number, value: any).
// removals will have added set to false.
List.prototype.withPatchesApplied = function (patches, operationCallback) {
    this.__getBuffer();

    if (!operationCallback) {
        operationCallback = function (added, index, value) {};
    }

    var patched = this;

    patches.forEach(function (patch) {
        switch (patch.type) {
        case ListPatches.PUSH:
            patched = patched.push(patch.data);
            operationCallback(true, patched.size() - 1, patch.data);
            break;

        case ListPatches.POP:
            operationCallback(false, patched.size() - 1, patched.get(patched.size() - 1));
            patched = patched.pop();
            break;

        case ListPatches.SET:
            operationCallback(false, patch.data[0], patched.get(patch.data[0]));
            operationCallback(true, patch.data[0], patch.data[1]);
            patched = patched.set.apply(patched, patch.data);
            break;

        case ListPatches.SPLICE:
            patched = patched.splice.apply(patched, patch.data);

            // removal callbacks
            patched.removedValues.forEach(function (value, index) {
                operationCallback(false, patch.data[0] + index, value);
            });

            // addition callbacks
            for (var i = 2; i < patch.data.length; ++i) {
                operationCallback(true, patch.data[0] + (i - 2), patch.data[i]);
            }

            break;

        default:
            throw new Error('unknown patch type: ' + patch.type);
        }
    });

    return patched;
};

module.exports = List;
