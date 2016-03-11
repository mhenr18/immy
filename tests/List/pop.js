var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#pop()', function () {
        it('should return a new list with the last value removed', function () {
            var list = new Immy.List(['abc', 'def', 'ghi']);
            var popped = list.pop();

            assert.notEqual(list, popped);
            assert.equal(popped.size(), 2);
            assert.equal(popped.get(1), 'def');
            assert.equal(popped.get(0), 'abc');
        });

        it('should not modify the existing list', function () {
            var list = new Immy.List(['abc', 'def', 'ghi']);
            list.pop();

            assert.equal(list.size(), 3);
            assert.equal(list.get(0), 'abc');
            assert.equal(list.get(1), 'def');
            assert.equal(list.get(2), 'ghi');
        });
    });
});
