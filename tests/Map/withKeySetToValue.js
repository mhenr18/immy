var assert = require('assert');
var Immy = require('../../src/immy');

describe('Map', function () {
    describe('#withKeySetToValue()', function () {
        it('should return a new map with the key associated with the new value', function () {
            var map = new Immy.Map(new Map([
                ['foo', 1],
                [2, 'bar'],
                ['baz', 'test']
            ]));

            var changed = map.withKeySetToValue('foo', 'abc');

            // ensure that's the only thing that changed
            assert.equal(changed.size(), 3);
            assert.equal(changed.get('foo'), 'abc');
            assert.equal(changed.get(2), 'bar');
            assert.equal(changed.get('baz'), 'test'); 

            // and also that the original map is unchanged
            assert.equal(map.size(), 3);
            assert.equal(map.get('foo'), 1);
            assert.equal(map.get(2), 'bar');
            assert.equal(map.get('baz'), 'test'); 

            // and that the new changed map also works after using the original
            assert.equal(changed.size(), 3);
            assert.equal(changed.get('foo'), 'abc');
            assert.equal(changed.get(2), 'bar');
            assert.equal(changed.get('baz'), 'test'); 
        });

        it('should work with null values', function () {
            var map = new Immy.Map(new Map([
                ['foo', 1],
                [2, 'bar'],
                ['baz', 'test']
            ]));

            var changed = map.withKeySetToValue('foo', null);

            // ensure that's the only thing that changed
            assert.equal(changed.size(), 3);
            assert.equal(changed.get('foo'), null);
            assert(changed.has('foo'));
            assert.equal(changed.get(2), 'bar');
            assert.equal(changed.get('baz'), 'test'); 

            // and also that the original map is unchanged
            assert.equal(map.size(), 3);
            assert.equal(map.get('foo'), 1);
            assert.equal(map.get(2), 'bar');
            assert.equal(map.get('baz'), 'test');
        });
    });
});
