var chai = require('chai');
var assert = chai.assert;
var Immy = require('../../src/immy');

function compareMaps(a, b) {
    assert.equal(a.size, b.size);

    for (var k of a.keys()) {
        assert(b.has(k));
        assert.equal(a.get(k), b.get(k));
    }
}

describe('MapPatches.Sequence', function () {
    describe('#apply()', function () {
        it('should work with multiple sets', function () {
            var map = new Map([
                ['foo', 'bar'],
                [1, 2],
                ['abc', 'def']
            ]);

            var patch = new Immy.MapPatches.Sequence([
                new Immy.MapPatches.Set('foo', 'bar', 'baz'),
                new Immy.MapPatches.Set(3, undefined, 4)
            ]);

            patch.apply(map);

            compareMaps(map, new Map([
                ['foo', 'baz'],
                [1, 2],
                ['abc', 'def'],
                [3, 4]
            ]));
        });

        it('should work with nested sequences', function () {
            var map = new Map([
                ['foo', 'bar'],
                [1, 2],
                ['abc', 'def']
            ]);

            var patch = new Immy.MapPatches.Sequence([
                new Immy.MapPatches.Set('foo', 'bar', 'baz'),
                new Immy.MapPatches.Set(3, undefined, 4),
                new Immy.MapPatches.Sequence([
                    new Immy.MapPatches.Set('abc', 'def', 'ghi'),
                    new Immy.MapPatches.Sequence([
                        new Immy.MapPatches.Set('abc', 'ghi', 'jkl')
                    ]),
                    new Immy.MapPatches.Set(3, 4, 5)
                ]),
                new Immy.MapPatches.Set(1, 2, undefined)
            ]);

            patch.apply(map);

            compareMaps(map, new Map([
                ['foo', 'baz'],
                ['abc', 'jkl'],
                [3, 5]
            ]));
        });
    });

    describe('#inverse()', function () {
        it('should work with sets', function () {
            var map = new Map([
                ['foo', 'bar'],
                [1, 2],
                ['abc', 'def']
            ]);

            var patch = new Immy.MapPatches.Sequence([
                new Immy.MapPatches.Set('foo', 'bar', 'baz'),
                new Immy.MapPatches.Set(3, undefined, 4)
            ]);

            patch.inverse().apply(map);

            compareMaps(map, new Map([
                ['foo', 'bar'],
                [1, 2],
                ['abc', 'def']
            ]));
        });
    });

    describe('#toPrimitives()', function () {
        it('should flatten out the sequence and nested sequences into primitive operations', function () {
            var patch = new Immy.MapPatches.Sequence([
                new Immy.MapPatches.Set('foo', 'bar', 'baz'),
                new Immy.MapPatches.Set(3, undefined, 4),
                new Immy.MapPatches.Sequence([
                    new Immy.MapPatches.Set('abc', 'def', 'ghi'),
                    new Immy.MapPatches.Sequence([
                        new Immy.MapPatches.Set('abc', 'ghi', 'jkl')
                    ]),
                    new Immy.MapPatches.Set(3, 4, 5)
                ]),
                new Immy.MapPatches.Set(1, 2, undefined)
            ]);

            var primitives = patch.toPrimitives();

            assert.equal(primitives.length, 6);

            assert(primitives[0] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[0].key, 'foo');
            assert.equal(primitives[0].oldValue, 'bar');
            assert.equal(primitives[0].newValue, 'baz');

            assert(primitives[1] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[1].key, 3);
            assert.equal(primitives[1].oldValue, undefined);
            assert.equal(primitives[1].newValue, 4);

            assert(primitives[2] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[2].key, 'abc');
            assert.equal(primitives[2].oldValue, 'def');
            assert.equal(primitives[2].newValue, 'ghi');

            assert(primitives[3] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[3].key, 'abc');
            assert.equal(primitives[3].oldValue, 'ghi');
            assert.equal(primitives[3].newValue, 'jkl');

            assert(primitives[4] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[4].key, 3);
            assert.equal(primitives[4].oldValue, 4);
            assert.equal(primitives[4].newValue, 5);

            assert(primitives[5] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[5].key, 1);
            assert.equal(primitives[5].oldValue, 2);
            assert.equal(primitives[5].newValue, undefined);
        });
    });

    describe('#forEachPrimitive()', function () {
        it('should iterate over all of the same primitive operations as toPrimitives', function () {
            var patch = new Immy.MapPatches.Sequence([
                new Immy.MapPatches.Set('foo', 'bar', 'baz'),
                new Immy.MapPatches.Set(3, undefined, 4),
                new Immy.MapPatches.Sequence([
                    new Immy.MapPatches.Set('abc', 'def', 'ghi'),
                    new Immy.MapPatches.Sequence([
                        new Immy.MapPatches.Set('abc', 'ghi', 'jkl')
                    ]),
                    new Immy.MapPatches.Set(3, 4, 5)
                ]),
                new Immy.MapPatches.Set(1, 2, undefined)
            ]);

            var primitives = [];

            patch.forEachPrimitive(function (primOp) {
                primitives.push(primOp);
            });

            assert.equal(primitives.length, 6);

            assert(primitives[0] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[0].key, 'foo');
            assert.equal(primitives[0].oldValue, 'bar');
            assert.equal(primitives[0].newValue, 'baz');

            assert(primitives[1] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[1].key, 3);
            assert.equal(primitives[1].oldValue, undefined);
            assert.equal(primitives[1].newValue, 4);

            assert(primitives[2] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[2].key, 'abc');
            assert.equal(primitives[2].oldValue, 'def');
            assert.equal(primitives[2].newValue, 'ghi');

            assert(primitives[3] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[3].key, 'abc');
            assert.equal(primitives[3].oldValue, 'ghi');
            assert.equal(primitives[3].newValue, 'jkl');

            assert(primitives[4] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[4].key, 3);
            assert.equal(primitives[4].oldValue, 4);
            assert.equal(primitives[4].newValue, 5);

            assert(primitives[5] instanceof Immy.MapPatches.Set);
            assert.equal(primitives[5].key, 1);
            assert.equal(primitives[5].oldValue, 2);
            assert.equal(primitives[5].newValue, undefined);
        });
    });
});
