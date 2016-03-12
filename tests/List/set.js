var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#set()', function () {
        it('should return a new list with the value changed', function () {
            var list = new Immy.List([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
            var changed = list.set(6, 99);

            assert.equal(changed.get(6), 99);
        });

        it('should not add or remove other values', function () {
            var list = new Immy.List([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
            var changed = list.set(6, 99);

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
            var changed = list.set(6, 99);

            assert.equal(list.get(6), 8);
        });

        it('should be patchable back and forth', function () {
            var a = new Immy.List([0, 1, 2, 3]);
            var b = a.set(2, 24);
            var c = b.set(2, 99);

            assert.equal(a.get(2), 2);
            assert.equal(b.get(2), 24);
            assert.equal(c.get(2), 99);
            assert.equal(b.get(2), 24);
            assert.equal(a.get(2), 2);
            assert.equal(b.get(2), 24);
            assert.equal(c.get(2), 99);
            assert.equal(a.get(2), 2);
        });
    });
});
