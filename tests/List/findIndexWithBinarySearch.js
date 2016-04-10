var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#findIndexWithBinarySearch()', function () {
        it('should work in a general case', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            var index = list.findIndexWithBinarySearch(function (value) {
                return value - 4;
            });

            assert.equal(index, 4);
        });

        it('should return -1 for a value not in the list', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            var index = list.findIndexWithBinarySearch(function (value) {
                return value - 10;
            });

            assert.equal(index, -1);
        });

        it('should find values at the beginning of the list', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            var index = list.findIndexWithBinarySearch(function (value) {
                return value - 0;
            });

            assert.equal(index, 0);
        });

        it('should find values at the end of the list', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            var index = list.findIndexWithBinarySearch(function (value) {
                return value - 5;
            });

            assert.equal(index, 5);
        });

        it('should always find values at the end of contiguous sequences', function () {
            var list = new Immy.List([0, 1, 2, 2, 2, 3, 4, 5]);

            var index = list.findIndexWithBinarySearch(function (value) {
                return value - 2;
            });

            assert.equal(index, 4);
        });
    });
});
