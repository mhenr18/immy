var assert = require('assert');
var Immy = require('../../src/immy');

describe('Map', function () {
    describe('#withKeyDeleted()', function () {
        it('should return a new map with no value associated with the given key', function () {
            var map = new Immy.Map(new Map([
                ['foo', 1],
                [2, 'bar'],
                ['baz', 'test']
            ]));

            var changed = map.withKeyDeleted(2);

            // ensure that's the only thing that changed
            assert.equal(changed.size(), 2);
            assert.equal(changed.get(2), undefined);
            assert.equal(changed.get('foo'), 1);
            assert.equal(changed.get('baz'), 'test'); 

            // and also that the original map is unchanged
            assert.equal(map.size(), 3);
            assert.equal(map.get('foo'), 1);
            assert.equal(map.get(2), 'bar');
            assert.equal(map.get('baz'), 'test'); 
        });
    });
});
