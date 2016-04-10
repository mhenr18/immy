var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#findInsertionIndexWithBinarySearch()', function () {
        it('should work in a simple case', function () {
            var list = new Immy.List([0, 1, 2, 4, 5]);

            var index = list.findInsertionIndexWithBinarySearch(function (value) {
                return value - 3;
            });

            assert.equal(index, 3);
        });

        it('should work at the beginning of the list', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            var index = list.findInsertionIndexWithBinarySearch(function (value) {
                return value - (-1);
            });

            assert.equal(index, 0);
        });

        it('should work at the end of the list', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            var index = list.findInsertionIndexWithBinarySearch(function (value) {
                return value - 10;
            });

            assert.equal(index, 6);
        });

        it('should work with an empty list', function () {
            var list = new Immy.List([]);

            var index = list.findInsertionIndexWithBinarySearch(function (value) {
                return value - 10;
            });

            assert.equal(index, 0);
        });

        it('should return indexes that are one after contiguous sequences', function () {
            var list = new Immy.List([0, 1, 2, 2, 2, 3, 4, 5]);

            var index = list.findInsertionIndexWithBinarySearch(function (value) {
                return value - 2;
            });

            assert.equal(index, 5);
        });
    });
});
