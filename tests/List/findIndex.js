var assert = require('assert');
var Immy = require('../../src/immy');

// findIndex is like forEach but with the whole "return true to exit with that
// index" thing, so we reuse the forEach tests verbatim before we test the
// returning functionality

describe('List', function () {
    describe('#findIndex()', function () {
        it('should iterate over the expected values', function () {
            var fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            var list = new Immy.List(fib);
            var iteratedValues = [];

            list.findIndex(function (value) {
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

            list.findIndex(function (value, index) {
                assert.equal(fib[index], value);
            });
        });

        it('should not mutate the original list', function () {
            var fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            var list = new Immy.List(fib);

            // obviously this won't mutate, this is more to prevent self
            // mutation
            list.findIndex(function (value, index) {
                value = 10;
            });

            assert.equal(fib.length, list.size());
            for (var i = 0; i < fib.length; ++i) {
                assert.equal(fib[i], list.get(i));
            }
        });

        it('should return the index of the first value where the predicate returns true', function () {
            var fib = ['abc', 'def', 'ghi', 'def', 'jkl'];
            var list = new Immy.List(fib);

            assert.equal(list.findIndex(function (value) { return value == 'def'; }), 1);
        });

        it('should return -1 if the predicate never returns true', function () {
            var fib = ['abc', 'def', 'ghi', 'def', 'jkl'];
            var list = new Immy.List(fib);

            assert.equal(list.findIndex(function (value) { return value == 'foobar'; }), -1);
        });

        it('should not continue iterating once the value has been found', function () {
            var fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            var list = new Immy.List(fib);
            var iteratedValues = [];

            list.findIndex(function (value) {
                iteratedValues.push(value);
                return value == 3;
            });

            assert.equal(iteratedValues.length, 5);
            for (var i = 0; i < 5; ++i) {
                assert.equal(fib[i], iteratedValues[i]);
            }
        });
    });
});
