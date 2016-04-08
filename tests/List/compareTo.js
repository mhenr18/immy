var chai = require('chai');
var assert = chai.assert;
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#compareTo()', function () {
        it('should return an empty diff if compared to itself', function () {
            var list = new Immy.List([0, 1, 2]);
            var patch = list.compareTo(list);

            assert(patch instanceof Immy.ListPatches.Sequence);
            assert.equal(patch.patches.length, 0);

            var listWithPatchApplied = list.withPatchApplied(patch);

            assert.equal(listWithPatchApplied.size(), 3);
            assert.equal(listWithPatchApplied.get(0), 0);
            assert.equal(listWithPatchApplied.get(1), 1);
            assert.equal(listWithPatchApplied.get(2), 2);
        });

        it('should return a diff that will result in the same list values when supplied with a non-related but equivalent list', function () {
            var listA = new Immy.List([0, 1, 2]);
            var listB = new Immy.List([0, 1, 2]);
            var diff = listA.compareTo(listB);

            var listAWithPatchApplied = listA.withPatchApplied(diff);

            assert.equal(listAWithPatchApplied.size(), 3);
            assert.equal(listAWithPatchApplied.get(0), 0);
            assert.equal(listAWithPatchApplied.get(1), 1);
            assert.equal(listAWithPatchApplied.get(2), 2);
        });

        it('should return an efficient patch if the lists are related by a single push', function () {
            var a = new Immy.List([0, 1, 2, 3]);
            var b = a.push(4);
            var diff = a.compareTo(b);

            assert(diff instanceof Immy.ListPatches.Add);
            assert.equal(diff.index, 4);
            assert.equal(diff.value, 4);
        });

        it('should return an efficient patch if the lists are related by many operations', function () {
            var a = new Immy.List([0, 1, 2, 3]);
            var b = a.push(4);
            var c = b.push('foo');
            var d = c.splice(1, 1, 'bar');

            var diff = a.compareTo(d);

            // we don't do any assertions about the diff itself here, because we
            // will likely end up optimizing certain patches like sets and splices
            // which would constantly break the tests. what we can assert on are
            // the primops of the diff.

            var primOps = diff.toPrimitives();
            assert.equal(primOps.length, 4);

            assert(primOps[0] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[0].index, 4);
            assert.equal(primOps[0].value, 4);

            assert(primOps[1] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[1].index, 5);
            assert.equal(primOps[1].value, 'foo');

            assert(primOps[2] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[2].index, 1);
            assert.equal(primOps[2].value, 1);

            assert(primOps[3] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[3].index, 1);
            assert.equal(primOps[3].value, 'bar');
        });

        it('should work when the target list does not have a buffer', function () {
            var a = new Immy.List([0, 1, 2, 3]);
            var b = a.push(4);
            var c = b.push('foo');
            var d = c.splice(1, 1, 'bar');

            var diff = d.compareTo(a);

            // this will be the complete inverse of the previous test

            var primOps = diff.toPrimitives();
            assert.equal(primOps.length, 4);

            assert(primOps[0] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[0].index, 1);
            assert.equal(primOps[0].value, 'bar');

            assert(primOps[1] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[1].index, 1);
            assert.equal(primOps[1].value, 1);

            assert(primOps[2] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[2].index, 5);
            assert.equal(primOps[2].value, 'foo');

            assert(primOps[3] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[3].index, 4);
            assert.equal(primOps[3].value, 4);
        });

        it('should work when neither list has a buffer', function () {
            var a = new Immy.List([0, 1, 2, 3]);
            var b = a.push(4);
            var c = b.push('foo');
            var d = c.splice(1, 1, 'bar');

            var diff = a.compareTo(c);

            // same as the one about relation by many, except not including d

            var primOps = diff.toPrimitives();
            assert.equal(primOps.length, 2);

            assert(primOps[0] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[0].index, 4);
            assert.equal(primOps[0].value, 4);

            assert(primOps[1] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[1].index, 5);
            assert.equal(primOps[1].value, 'foo');
        });
    });
});
