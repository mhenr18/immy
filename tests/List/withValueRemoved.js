var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#withValueRemoved()', function () {
        it('should return a new list with the value removed from the given index', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl']);
            list = list.withValueRemoved(1);

            assert.equal(list.size(), 3);
            assert.equal(list.get(0), 'abc');
            assert.equal(list.get(1), 'ghi');
            assert.equal(list.get(2), 'jkl');
        });
    });
});
