var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#forEach()', function () {
        it('should iterate over the expected values', function () {
            var fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            var list = new Immy.List(fib);
            var iteratedValues = [];

            list.forEach(function (value) {
                iteratedValues.push(value);
            });

            assert.equal(fib.length, iteratedValues.length);
            for (var i = 0; i < fib.length; ++i) {
                assert.equal(fib[i], iteratedValues[i]);
            }
        });

        it('should provide the index as the second argument', function () {
            var fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            var list = new Immy.List(fib);

            list.forEach(function (value, index) {
                assert.equal(fib[index], value);
            });
        });

        it('should not mutate the original list', function () {
            var fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            var list = new Immy.List(fib);

            // obviously this won't mutate, this is more to prevent self
            // mutation
            list.forEach(function (value, index) {
                value = 10;
            });

            assert.equal(fib.length, list.size());
            for (var i = 0; i < fib.length; ++i) {
                assert.equal(fib[i], list.get(i));
            }
        });
    });
});
