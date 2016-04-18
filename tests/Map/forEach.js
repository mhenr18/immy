var chai = require('chai');
var assert = chai.assert;
var Immy = require('../../src/immy');

describe('Map', function () {
    describe('#forEach()', function () {
        it('should iterate over the expected values in order', function () {
            var fib = [
                [0, 0],
                [1, 1],
                [2, 1],
                [3, 2],
                [4, 3],
                [5, 5],
                [6, 8],
                [7, 13],
                [8, 21],
                [9, 34]
            ];

            var list = new Immy.Map(new Map(fib));
            var iteratedValues = [];

            list.forEach(function (value, key) {
                iteratedValues.push([key, value]);
            });

            assert.deepEqual(fib, iteratedValues);
        });
    });
});
