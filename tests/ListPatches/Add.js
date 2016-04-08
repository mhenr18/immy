var chai = require('chai');
var assert = chai.assert;
var Immy = require('../../src/immy');

describe('ListPatches.Add', function () {
    describe('#apply()', function () {
        it('should add the given value at the given index', function () {
            var array = [0, 1, 2, 3];
            var patch = new Immy.ListPatches.Add(2, 'foo');
            patch.apply(array);

            assert.deepEqual(array, [0, 1, 'foo', 2, 3]);
        });
    });

    describe('#inverse()', function () {
        it('should return an inverse of the patch', function () {
            var array = [0, 1, 'foo', 2, 3];
            var patch = new Immy.ListPatches.Add(2, 'foo');
            var inverse = patch.inverse();
            inverse.apply(array);

            assert.deepEqual(array, [0, 1, 2, 3]);
        });
    });

    describe('#toPrimitives()', function () {
        it('should return an array containing the same add patch', function () {
            var patch = new Immy.ListPatches.Add(2, 'foo');
            var primitives = patch.toPrimitives();

            assert.equal(primitives.length, 1);
            assert(primitives[0] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[0].index, 2);
            assert.equal(primitives[0].value, 'foo');
        });
    });
});
