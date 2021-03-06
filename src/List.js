var ListPatches = require('./ListPatches');

// a List either owns a buffer and has the data, or has a reference to another
// list and a patch that can be applied to that list to get at this list's data.

function List(initBuffer) {
    if (initBuffer != null) {
        this.buffer = initBuffer.slice();
    } else {
        this.buffer = null;
    }

    this.patchSource = null;
    this.patch = null;

    // lists that share a root share a buffer. {} != {} because objects are
    // compared using reference equality, so this will always be globally unique
    this.root = {};
}


// ensures that the list has a buffer that can be used.
List.prototype.__getBuffer = function () {
  if (this.buffer) {
    return
  }

  if (!this.patchSource) {
    // no patch source and no buffer means that we're an empty list
    this.buffer = []
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

    target.patch.apply(source.buffer);
    source.patchSource = target;
    source.patch = target.patch.inverse();
    target.buffer = source.buffer;
    source.buffer = null;
    target.patchSource = null;

    source = target
  }
}

List.prototype.push = function (value) {
    if (!this.buffer) this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = new ListPatches.Remove(this.buffer.length, value);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer.push(value);
    newList.root = this.root;

    return newList;
};

List.prototype.withValueAdded = function (index, value) {
    if (!this.buffer) this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = new ListPatches.Remove(index, value);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer.splice(index, 0, value);
    newList.root = this.root;

    return newList;
};

List.prototype.withValueRemoved = function (index) {
    if (!this.buffer) this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = new ListPatches.Add(index, this.buffer[index]);

    newList.buffer = this.buffer;
    this.buffer = null;
    newList.buffer.splice(index, 1);
    newList.root = this.root;

    return newList;
};

List.prototype.pop = function () {
    if (!this.buffer) this.__getBuffer();

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
    if (!this.buffer) this.__getBuffer();
    return this.buffer.length;
};

List.prototype.get = function (index) {
    if (!this.buffer) this.__getBuffer();
    return this.buffer[index];
};

List.prototype.set = function (index, newValue) {
    if (!this.buffer) this.__getBuffer();

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
    if (!this.buffer) this.__getBuffer();
    this.buffer.forEach(fn);
};

List.prototype.findIndex = function (pred) {
    if (!this.buffer) this.__getBuffer();
    return this.buffer.findIndex(pred);
};

// comparisonPred should return 0 if the supplied value is equal to the target,
// -ve if it's less than the target, and +ve if it's greater than the target. note
// that this function doesn't take the target itself as an argument.
List.prototype.findIndexWithBinarySearch = function (comparisonPred) {
    if (!this.buffer) this.__getBuffer();

    var minIndex = 0;
    var maxIndex = this.buffer.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this.buffer[currentIndex];

        var res = comparisonPred(currentElement);

        if (res < 0) {
            minIndex = currentIndex + 1;
        } else if (res > 0) {
            maxIndex = currentIndex - 1;
        } else {
            // make sure that we return the index of the value that's at the end
            // of the sequence
            while (currentIndex < this.buffer.length - 1 && comparisonPred(this.buffer[currentIndex + 1]) == 0) {
                ++currentIndex;
            }

            return currentIndex;
        }
    }

    return -1;
};

List.prototype.findInsertionIndexWithBinarySearch = function (comparisonPred) {
    if (!this.buffer) this.__getBuffer();

    if (this.buffer.length == 0) {
        return 0;
    }

    var minIndex = 0;
    var maxIndex = this.buffer.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this.buffer[currentIndex];

        var res = comparisonPred(currentElement);

        if (res < 0) {
            minIndex = currentIndex + 1;
        } else if (res > 0) {
            maxIndex = currentIndex - 1;
        } else {
            // found an identical value, go to the end of the sequence and then
            // return the index that's one after that
            while (currentIndex < this.buffer.length - 1 && comparisonPred(this.buffer[currentIndex + 1]) == 0) {
                ++currentIndex;
            }

            return currentIndex + 1;
        }
    }

    var res = comparisonPred(this.buffer[currentIndex]);
    if (res > 0) {
        // need to insert a value that will be before the current one, so use its
        // index
        return currentIndex;
    } else {
        // we want to insert after this value
        return currentIndex + 1;
    }
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

    if (!this.buffer) this.__getBuffer();

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

List.prototype.compareTo = function (otherList, hints) {
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

            if (!this.buffer) this.__getBuffer();
            return walk(otherList);
        }
    } else {
        // will result in both lists having buffers as we know that they aren't
        // sharing one due to having different roots
        if (!this.buffer) this.__getBuffer();
        otherList.__getBuffer();

        if (hints && hints.ordered) {
            return orderedDiff(this.buffer, otherList.buffer, hints.comparison);
        }

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

// O(n) version of diff() that requires the A and B arrays to be ordered
// the comparison function should be like any other list comparison method:
//
//   -ve if a < b
//   0 if a = b
//   +ve if a > b
//
function orderedDiff(A, B, comparison) {
    var patches = [];
    var i, j, k;

    count = 0;
    for (i = 0, j = 0, k = 0; i < A.length && j < B.length; ++k) {
        var res = comparison(A[i], B[j]);

        if (res == null) {
            // replacement, remove and add without changing the insertion index
            patches.push(new ListPatches.Remove(k, A[i]));
            patches.push(new ListPatches.Add(k, B[j]));
            ++i;
            ++j;
        } else if (res == 0) {
            // not changed
            ++i;
            ++j;
        } else if (res < 0) {
            // A[i] < B[j]
            // means that we need to nuke stuff from A until we catch up, keep B
            // at the same place
            patches.push(new ListPatches.Remove(k, A[i]));
            ++i;
            --k;
        } else {
            // A[i] > B[j]
            // means that we added stuff to B that's less than where we are in A,
            // emit Add ops and catch B up
            patches.push(new ListPatches.Add(k, B[j]));
            ++j;
        }
    }

    if (i == A.length && j != B.length) {
        // everything at the end of B is adds
        while (j < B.length) {
            patches.push(new ListPatches.Add(k, B[j]));
            ++j;
            ++k;
        }
    } else if (i != A.length && j == B.length) {
        // everything at the end of A is removes
        while (i < A.length) {
            patches.push(new ListPatches.Remove(k, A[i]));
            ++i;
        }
    }

    return new ListPatches.Sequence(patches);
}

List.prototype.withPatchApplied = function (patch) {
    if (!this.buffer) this.__getBuffer();

    var newList = new List();
    this.patchSource = newList;
    this.patch = patch.inverse();

    newList.buffer = this.buffer;
    this.buffer = null;
    patch.apply(newList.buffer);

    return newList;
};

module.exports = List;
