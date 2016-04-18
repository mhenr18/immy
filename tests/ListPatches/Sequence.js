var chai = require('chai');
var assert = chai.assert;
var Immy = require('../../src/immy');

describe('ListPatches.Sequence', function () {
    describe('#apply()', function () {
        it('should work with multiple adds', function () {
            var array = [0, 1, 2, 3];
            var patch = new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Add(2, 'foo'),
                new Immy.ListPatches.Add(2, 'bar'),
            ]);

            patch.apply(array);

            assert.deepEqual(array, [0, 1, 'bar', 'foo', 2, 3]);
        });

        it('should work with multiple removes', function () {
            var array = [0, 1, 2, 3];
            var patch = new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Remove(0, 0),
                new Immy.ListPatches.Remove(2, 3),
            ]);

            patch.apply(array);

            assert.deepEqual(array, [1, 2]);
        });

        it('should work with nested sequences', function () {
            var array = [0, 1, 2, 3];
            var patch = new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Add(2, 'foo'),
                new Immy.ListPatches.Add(2, 'bar'),
                new Immy.ListPatches.Sequence([
                    new Immy.ListPatches.Remove(2, 'bar'),
                    new Immy.ListPatches.Sequence([
                        new Immy.ListPatches.Add(0, 'baz')
                    ]),
                    new Immy.ListPatches.Add(6, 'test')
                ])
            ]);

            patch.apply(array);

            assert.deepEqual(array, ['baz', 0, 1, 'foo', 2, 3, 'test']);
        });
    });

    describe('#inverse()', function () {
        it('should work with simple adds', function () {
            var array = [0, 1, 'bar', 'foo', 2, 3];
            var patch = new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Add(2, 'foo'),
                new Immy.ListPatches.Add(2, 'bar'),
            ]);

            var inverse = patch.inverse();
            inverse.apply(array);

            assert.deepEqual(array, [0, 1, 2, 3]);
        });
    });

    describe('#toPrimitives()', function () {
        it('should flatten out the sequence and nested sequences into primitive operations', function () {
            var patch = new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Add(2, 'foo'),
                new Immy.ListPatches.Add(2, 'bar'),
                new Immy.ListPatches.Sequence([
                    new Immy.ListPatches.Remove(2, 'bar'),
                    new Immy.ListPatches.Sequence([
                        new Immy.ListPatches.Add(0, 'baz')
                    ]),
                    new Immy.ListPatches.Add(6, 'test')
                ])
            ]);

            var primitives = patch.toPrimitives();

            assert.equal(primitives.length, 5);

            assert(primitives[0] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[0].index, 2);
            assert.equal(primitives[0].value, 'foo');

            assert(primitives[1] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[1].index, 2);
            assert.equal(primitives[1].value, 'bar');

            assert(primitives[2] instanceof Immy.ListPatches.Remove);
            assert.equal(primitives[2].index, 2);
            assert.equal(primitives[2].value, 'bar');

            assert(primitives[3] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[3].index, 0);
            assert.equal(primitives[3].value, 'baz');

            assert(primitives[4] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[4].index, 6);
            assert.equal(primitives[4].value, 'test');
        });
    });

    describe('#forEachPrimitive()', function () {
        it('should iterate over all of the same primitive operations as toPrimitives', function () {
            var patch = new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Add(2, 'foo'),
                new Immy.ListPatches.Add(2, 'bar'),
                new Immy.ListPatches.Sequence([
                    new Immy.ListPatches.Remove(2, 'bar'),
                    new Immy.ListPatches.Sequence([
                        new Immy.ListPatches.Add(0, 'baz')
                    ]),
                    new Immy.ListPatches.Add(6, 'test')
                ])
            ]);

            var primitives = [];

            patch.forEachPrimitive(function (primOp) {
                primitives.push(primOp);
            });

            assert.equal(primitives.length, 5);

            assert(primitives[0] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[0].index, 2);
            assert.equal(primitives[0].value, 'foo');

            assert(primitives[1] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[1].index, 2);
            assert.equal(primitives[1].value, 'bar');

            assert(primitives[2] instanceof Immy.ListPatches.Remove);
            assert.equal(primitives[2].index, 2);
            assert.equal(primitives[2].value, 'bar');

            assert(primitives[3] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[3].index, 0);
            assert.equal(primitives[3].value, 'baz');

            assert(primitives[4] instanceof Immy.ListPatches.Add);
            assert.equal(primitives[4].index, 6);
            assert.equal(primitives[4].value, 'test');
        });
    });
});
