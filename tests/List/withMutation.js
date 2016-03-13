var assert = require('assert');
var Immy = require('../../src/immy');

// List.withMutation is just a slightly nicer way to call List.set(), so we
// include those tests re-worked to use this method

describe('List', function () {
    describe('#withMutation()', function () {
        it('should return a new list where the item at the given index is the value returned by the given function', function () {
            var list = new Immy.List([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
            var changed = list.withMutation(6, function () {
                return 99;
            });

            assert.equal(changed.get(6), 99);
        });

        it('should not add or remove other values', function () {
            var list = new Immy.List([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
            var changed = list.withMutation(6, function () {
                return 99;
            });

            assert.equal(changed.size(), list.size());
            assert.equal(changed.get(0), 0);
            assert.equal(changed.get(1), 1);
            assert.equal(changed.get(2), 1);
            assert.equal(changed.get(3), 2);
            assert.equal(changed.get(4), 3);
            assert.equal(changed.get(5), 5);
            assert.equal(changed.get(6), 99);
            assert.equal(changed.get(7), 13);
            assert.equal(changed.get(8), 21);
            assert.equal(changed.get(9), 34);
        });

        it('should not change the original list', function () {
            var list = new Immy.List([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
            var changed = list.withMutation(6, function () {
                return 99;
            });

            assert.equal(list.get(6), 8);
        });

        it('should be patchable back and forth', function () {
            var a = new Immy.List([0, 1, 2, 3]);
            var b = a.withMutation(2, function () {
                return 24;
            });
            var c = b.withMutation(2, function () {
                return 99;
            });

            assert.equal(a.get(2), 2);
            assert.equal(b.get(2), 24);
            assert.equal(c.get(2), 99);
            assert.equal(b.get(2), 24);
            assert.equal(a.get(2), 2);
            assert.equal(b.get(2), 24);
            assert.equal(c.get(2), 99);
            assert.equal(a.get(2), 2);
        });

        it('should provide the mutation function with the existing value', function () {
            var list = new Immy.List(['foo', 'bar', 'baz']);
            var changed = list.withMutation(1, function (value) {
                assert.equal(value, 'bar');
                return null;
            });
        });
    });
});
