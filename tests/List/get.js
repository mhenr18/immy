var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#get()', function () {
        it('should return the value at a given index', function () {
            var list = new Immy.List([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);

            assert.equal(list.get(0), 0);
            assert.equal(list.get(6), 8);
            assert.equal(list.get(8), 21);
            assert.equal(list.get(3), 2);
        });
    });
});
