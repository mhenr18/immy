var assert = require('assert');
var chai = require('chai');
var Immy = require('../../src/immy');

var expect = chai.expect;

describe('List', function () {
    describe('#withPatchesApplied()', function () {
        it('should return a new list with the given patches applied', function () {
            var list = new Immy.List([0, 1, 2, 3]);

            var newList = list.withPatchesApplied([
                Immy.ListPatches.makePopPatch(),
                Immy.ListPatches.makeSetPatch(1, 'foo')
            ]);

            assert.equal(newList.size(), 3);
            assert.equal(newList.get(0), 0);
            assert.equal(newList.get(1), 'foo');
            assert.equal(newList.get(2), 2);
        });

        it('should work with pushes', function () {
            var list = new Immy.List([0, 1, 2, 3]);
            var operations = [];

            var newList = list.withPatchesApplied([
                Immy.ListPatches.makePushPatch(4),
                Immy.ListPatches.makePushPatch(5)
            ], function (added, index, value) {
                operations.push([added, index, value]);
            });

            assert.equal(newList.size(), 6);
            assert.equal(newList.get(0), 0);
            assert.equal(newList.get(1), 1);
            assert.equal(newList.get(2), 2);
            assert.equal(newList.get(3), 3);
            assert.equal(newList.get(4), 4);
            assert.equal(newList.get(5), 5);

            // check operations
            assert.equal(operations.length, 2);
            assert.deepEqual(operations[0], [true, 4, 4]);
            assert.deepEqual(operations[1], [true, 5, 5]);
        });

        it('should work with pops', function () {
            var list = new Immy.List([0, 1, 2, 3]);
            var operations = [];

            var newList = list.withPatchesApplied([
                Immy.ListPatches.makePopPatch(),
                Immy.ListPatches.makePopPatch()
            ], function (added, index, value) {
                operations.push([added, index, value]);
            });

            assert.equal(newList.size(), 2);
            assert.equal(newList.get(0), 0);
            assert.equal(newList.get(1), 1);

            // check operations
            assert.equal(operations.length, 2);
            assert.deepEqual(operations[0], [false, 3, 3]);
            assert.deepEqual(operations[1], [false, 2, 2]);
        });

        it('should work with sets', function () {
            var list = new Immy.List([0, 1, 2, 3]);
            var operations = [];

            var newList = list.withPatchesApplied([
                Immy.ListPatches.makeSetPatch(2, 'bar'),
                Immy.ListPatches.makeSetPatch(0, 'foo')
            ], function (added, index, value) {
                operations.push([added, index, value]);
            });

            assert.equal(newList.size(), 4);
            assert.equal(newList.get(0), 'foo');
            assert.equal(newList.get(1), 1);
            assert.equal(newList.get(2), 'bar');
            assert.equal(newList.get(3), 3);

            // check operations
            assert.equal(operations.length, 4);
            assert.deepEqual(operations[0], [false, 2, 2]);
            assert.deepEqual(operations[1], [true, 2, 'bar']);
            assert.deepEqual(operations[2], [false, 0, 0]);
            assert.deepEqual(operations[3], [true, 0, 'foo']);
        });

        it('should work with splices', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);
            var operations = [];

            var newList = list.withPatchesApplied([
                // will result in [0, 'foo', 'bar', 4, 5]
                Immy.ListPatches.makeSplicePatch(1, 3, ['foo', 'bar']),

                // will give us [0, 'foo', 'abc', 7, 'bar', 4, 5]
                Immy.ListPatches.makeSplicePatch(2, 0, ['abc', 7]),
            ], function (added, index, value) {
                operations.push([added, index, value]);
            });

            assert.equal(newList.size(), 7);
            assert.equal(newList.get(0), 0);
            assert.equal(newList.get(1), 'foo');
            assert.equal(newList.get(2), 'abc');
            assert.equal(newList.get(3), 7);
            assert.equal(newList.get(4), 'bar');
            assert.equal(newList.get(5), 4);
            assert.equal(newList.get(6), 5);

            // check operations
            assert.equal(operations.length, 7);
            assert.deepEqual(operations[0], [false, 1, 1]);
            assert.deepEqual(operations[1], [false, 2, 2]);
            assert.deepEqual(operations[2], [false, 3, 3]);
            assert.deepEqual(operations[3], [true, 1, 'foo']);
            assert.deepEqual(operations[4], [true, 2, 'bar']);
            assert.deepEqual(operations[5], [true, 2, 'abc']);
            assert.deepEqual(operations[6], [true, 3, 7]);
        });

        it('should throw an error on bad patch types', function () {
            var list = new Immy.List([0, 1, 2, 3, 4, 5]);

            expect(function () {
                var newList = list.withPatchesApplied([
                    { type: 'NOT A PATCH TYPE', data: null }
                ]);
            }).to.throw(Error);
        });
    });
});
