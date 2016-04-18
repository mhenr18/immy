var assert = require('assert');
var Immy = require('../../src/immy');

describe('Map', function () {
    describe('#get()', function () {
        it('should return the value corresponding to the given key', function () {
            var map = new Immy.Map(new Map([
                ['foo', 1],
                [2, 'bar'],
                ['baz', 'test']
            ]));

            assert.equal(map.get('foo'), 1);
            assert.equal(map.get(2), 'bar');
            assert.equal(map.get('baz'), 'test'); 
        });

        it('should return undefined if that key does not exist in the map', function () {
            var map = new Immy.Map();
            assert.equal(map.get('foo'), undefined);
        });
    });
});
