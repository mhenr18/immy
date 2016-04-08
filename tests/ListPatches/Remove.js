var chai = require('chai');
var assert = chai.assert;
var Immy = require('../../src/immy');

describe('ListPatches.Remove', function () {
    describe('#apply()', function () {
        it('should remove the given value from the given index', function () {
            var array = [0, 1, 'foo', 2, 3];
            var patch = new Immy.ListPatches.Remove(2, 'foo');
            patch.apply(array);

            assert.deepEqual(array, [0, 1, 2, 3]);
        });
    });

    describe('#inverse()', function () {
        it('should return an inverse of the patch', function () {
            var array = [0, 1, 2, 3];
            var patch = new Immy.ListPatches.Remove(2, 'foo');
            var inverse = patch.inverse();
            inverse.apply(array);

            assert.deepEqual(array, [0, 1, 'foo', 2, 3]);
        });
    });

    describe('#toPrimitives()', function () {
        it('should return an array containing the same remove patch', function () {
            var patch = new Immy.ListPatches.Remove(2, 'foo');
            var primitives = patch.toPrimitives();

            assert.equal(primitives.length, 1);
            assert(primitives[0] instanceof Immy.ListPatches.Remove);
            assert.equal(primitives[0].index, 2);
            assert.equal(primitives[0].value, 'foo');
        });
    });
});
