var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#withValueAdded()', function () {
        it('should return a new list with the value inserted at the given index', function () {
            var list = new Immy.List();
            list = list.withValueAdded(0, 'def');
            list = list.withValueAdded(0, 'abc');
            list = list.withValueAdded(2, 'ghi');
            list = list.withValueAdded(3, 'jkl');

            assert.equal(list.size(), 4);
            assert.equal(list.get(0), 'abc');
            assert.equal(list.get(1), 'def');
            assert.equal(list.get(2), 'ghi');
            assert.equal(list.get(3), 'jkl');
        });
    });
});
