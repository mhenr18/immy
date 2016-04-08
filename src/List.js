var ListPatches = require('./ListPatches');

// a List either owns a buffer and has the data, or has a reference to another
// list and a patch that can be applied to that list to get at this list's data.

// lists that share a root share a buffer, this is a quick way of telling that
// (which is really useful for diffing because we can commit to walking the
// changelist with full knowledge that we'll end up at where we want to be)
var nextRoot = 0;

function List(initBuffer) {
    if (initBuffer != null) {
        this.buffer = initBuffer.slice();
    } else {
        this.buffer = null;
    }

    this.patchSource = null;
    this.patch = null;
    this.root = nextRoot++;
}

// ensures that the list has a buffer that can be used.
// TODO: reimplement this to not be recursive to avoid stack overflow on big lists
List.prototype.__getBuffer = function () {
    if (!this.buffer) {
        if (!this.patchSource) {
            // no patch source and no buffer means that we're an empty list
            this.buffer = [];
        } else {
            this.patchSource.__getBuffer();

            this.patch.apply(this.patchSource.buffer);

            this.patchSource.patchSource = this;
            this.patchSource.patch = this.patch.inverse();
            this.buffer = this.patchSource.buffer;
            this.patchSource.buffer = null;
            this.patchSource = null;
        }
    }
};

List.prototype.push = function (value) {
    this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = new ListPatches.Remove(this.buffer.length, value);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer.push(value);
    newList.root = this.root;

    return newList;
};

List.prototype.pop = function () {
    this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = new ListPatches.Add(this.buffer.length - 1, this.buffer[this.buffer.length - 1]);

    this.buffer.pop();
    newList.buffer = this.buffer;
    this.buffer = null;
    newList.root = this.root;

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
    this.patch = new ListPatches.Sequence([
        new ListPatches.Remove(index, newValue),
        new ListPatches.Add(index, this.buffer[index])
    ]);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer[index] = newValue;
    newList.root = this.root;

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
    // - the sliced list will have a separate root to us
    var sliced = new List();
    sliced.buffer = this.buffer.slice(begin, end);

    return sliced;
};

List.prototype.splice = function (start, deleteCount) { // [, item1, item2, ...]
    var i;

    if (start === 0 && deleteCount === 0 && arguments.length === 2) {
        return this;
    }

    if (start === undefined) {
        start = 0;
    }

    var deletedItems = this.buffer.splice.apply(this.buffer, arguments);
    var patches = [];

    // remove the newly added items
    for (i = 2; i < arguments.length; ++i) {
        patches.push(new ListPatches.Remove(start, arguments[i]));
    }

    // and re-insert the deleted items
    for (i = 0; i < deletedItems.length; ++i) {
        patches.push(new ListPatches.Add(start + i, deletedItems[i]));
    }

    var newList = new List();
    this.patchSource = newList;
    this.patch = new ListPatches.Sequence(patches);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.root = this.root;

    return newList;
};

// List.compareTo() a patch which will take this list and make it equal to the
// otherList. i.e, if I have [a, b].compareTo([a, b, c]) then i'll get a patch
// that will add c. swapping the lists will result in a patch that would remove c.
//
// the returned patches won't always be minimal, but they'll be correct.

List.prototype.compareTo = function (otherList) {
    if (otherList.root == this.root) {
        if (otherList == this) {
            return new ListPatches.Sequence([]);
        }

        // guarantee that following the one without a buffer to one with buffer
        // will get us to the other one, as all lists that share the same root
        // are working with patches to the same buffer
        if (this.buffer) {
            // perfect, we can walk from the other list to this and end up with a
            // patch that will go the other way
            return walk(otherList);
        } else if (otherList.buffer) {
            // need to walk from this to the otherList and then return an inverse
            // patch from the walk
            return walk(this).inverse();
        } else {
            // nothing has a buffer, so we need to give one of our lists a buffer
            // to guarantee that we can walk from one and end up at the other. the
            // walk will result in a reversed patch from dst to src, so we give
            // this list a buffer and walk from the other list. that way, we don't
            // have to invert the patch before returning it

            this.__getBuffer();
            return walk(otherList);
        }
    } else {
        // will result in both lists having buffers as we know that they aren't
        // sharing one due to having different roots
        this.__getBuffer();
        otherList.__getBuffer();

        // we can't walk from one to the other, so we need to use an actual diff
        // algorithm (ideally) to figure out a patch
        return diff(this.buffer, otherList.buffer);
    }
};

function walk(src) {
    var patches = [];
    var curr = src;

    // we should be unshifting, but that's slow. so, we push and do a single
    // reverse at the end.
    while (!curr.buffer) {
        patches.push(curr.patch);
        curr = curr.patchSource;
    }

    patches.reverse();
    
    if (patches.length == 1) {
        return patches[0];
    } else {
        return new ListPatches.Sequence(patches);
    }
}

// returns a patch that will take the from array and make it become the to array.
// note: FROM AND TO ARE JUST JS ARRAYS, NOT IMMY LISTS.
function diff(fromArr, to) {
    // take the lame way out and return a "patch" that literally just removes
    // everything and then adds the entire contents of the "to" array using a
    // single splice.
    //
    // TODO: rewrite this!

    var i;
    var patches = [];

    // remove everything in "from"
    for (i = fromArr.length - 1; i >= 0; --i) {
        patches.push(new ListPatches.Remove(i, fromArr[i]));
    }

    // add all of "to"
    for (i = 0; i < to.length; ++i) {
        patches.push(new ListPatches.Add(i, to[i]));
    }

    return new ListPatches.Sequence(patches);
}

List.prototype.withPatchApplied = function (patch) {
    this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = patch.inverse();

    newList.buffer = this.buffer;
    this.buffer = null;
    patch.apply(newList.buffer);

    return newList;
};

module.exports = List;
