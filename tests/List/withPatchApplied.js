var assert = require('assert');
var chai = require('chai');
var Immy = require('../../src/immy');

var expect = chai.expect;

describe('List', function () {
    describe('#withPatchApplied()', function () {
        it('should apply the given patch', function () {
            var list = new Immy.List([0, 1, 2, 3]);

            var newList = list.withPatchApplied(new Immy.ListPatches.Sequence([
                new Immy.ListPatches.Remove(3, 3),
                new Immy.ListPatches.Add(1, 'foo')
            ]));

            assert.equal(newList.size(), 4);
            assert.equal(newList.get(0), 0);
            assert.equal(newList.get(1), 'foo');
            assert.equal(newList.get(2), 1);
            assert.equal(newList.get(3), 2);
        });
    });
});
