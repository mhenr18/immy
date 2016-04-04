var assert = require('assert');
var Immy = require('../../src/immy');

// all of these tests also check for zero mutation of the original.
// to clean them up, we use a little helper for comparing immy lists without
// using Immy.equals (otherwise if that method broke we may end up with false
// positives in these tests)

function assertImmyListEquals(immyList, arr) {
    assert.equal(immyList.size(), arr.length);

    for (var i = 0; i < arr.length; ++i) {
        assert.equal(immyList.get(i), arr[i]);
    }
}

describe('List', function () {
    describe('#splice()', function () {
        it('should return the original list if the start and deleteCount are zero', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(0, 0);

            assert.equal(list, cpy);
        });

        it('should work with a startCount of zero with no deleteCount', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(0, 0, 'uvw', 'xyz');

            assertImmyListEquals(cpy,
                ['uvw', 'xyz', 'abc', 'def', 'ghi', 'jkl', 'mno']);
        });

        it('should work with a startCount of zero with a non-zero deleteCount', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(0, 3, 'uvw', 'xyz');

            assertImmyListEquals(cpy, ['uvw', 'xyz', 'jkl', 'mno']);
        });

        it('should work with a startCount of zero with a non-zero deleteCount and no items added', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(0, 3);

            assertImmyListEquals(cpy, ['jkl', 'mno']);
        });

        it('should work with a startCount in the middle of the list with no deleteCount', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(2, 0, 'uvw', 'xyz');

            assertImmyListEquals(cpy,
                ['abc', 'def', 'uvw', 'xyz', 'ghi', 'jkl', 'mno']);
        });

        it('should work with a startCount in the middle of the list with a non-zero deleteCount', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(1, 3, 'uvw', 'xyz');

            assertImmyListEquals(cpy, ['abc', 'uvw', 'xyz', 'mno']);
        });

        it('should work with a startCount in the middle of the list with a non-zero deleteCount and no items added', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(1, 3);

            assertImmyListEquals(cpy, ['abc', 'mno']);
        });

        it('should work with a startCount of list.size() and no deleteCount', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(list.size(), 0, 'uvw', 'xyz');

            assertImmyListEquals(cpy,
                ['abc', 'def', 'ghi', 'jkl', 'mno', 'uvw', 'xyz']);
        });

        it('should work with a deleteCount greater than the size of the list', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(2, 9999);

            assertImmyListEquals(cpy, ['abc', 'def']);
        });

        it('should work when used back and forth', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.splice(1, 3, 'uvw', 'xyz');

            assertImmyListEquals(cpy, ['abc', 'uvw', 'xyz', 'mno']);
            assertImmyListEquals(list, ['abc', 'def', 'ghi', 'jkl', 'mno']);
            assertImmyListEquals(cpy, ['abc', 'uvw', 'xyz', 'mno']);
            assertImmyListEquals(list, ['abc', 'def', 'ghi', 'jkl', 'mno']);
        });
    });
});
