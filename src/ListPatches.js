
exports.NONE = -1;
exports.POP = 0;
exports.PUSH = 1;
exports.SET = 2;
exports.SPLICE = 3;

exports.makePopPatch = function () {
    return {
        type: exports.POP,
        data: null
    };
};

exports.makePushPatch = function (item) {
    return {
        type: exports.PUSH,
        data: item
    };
};

exports.makeSetPatch = function (index, item) {
    return {
        type: exports.SET,
        data: [index, item]
    };
};

// note, not like splice itself where the items are varargs to the function. here
// the items are just an array.
exports.makeSplicePatch = function (start, length, itemsToAdd) {
    return {
        type: exports.SPLICE,
        data: [start, length].concat(itemsToAdd)
    };
};
