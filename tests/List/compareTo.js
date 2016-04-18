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

        it('should return an efficient diff if disjoint lists are ordered', function () {
            var a = new Immy.List([1,    3, 5, 7,    9]);
            var b = new Immy.List([1, 2, 3,    7, 8])

            // from a -> b, the diff is +2, -5, +8, -9 (going in order).
            // a disjoint ordered diff guarantees that all operations will be in
            // order of the difference.

            var patch = a.compareTo(b, {
                ordered: true,
                comparison: function (a, b) {
                    return a - b;
                }
            });

            var primOps = patch.toPrimitives();
            assert.equal(primOps.length, 4);

            assert(primOps[0] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[0].index, 1);
            assert.equal(primOps[0].value, 2);

            assert(primOps[1] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[1].index, 3);
            assert.equal(primOps[1].value, 5);

            assert(primOps[2] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[2].index, 4);
            assert.equal(primOps[2].value, 8);

            assert(primOps[3] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[3].index, 5);
            assert.equal(primOps[3].value, 9);
        });

        it('should return a valid diff for ordered lists', function () {
            // run many tests of random ordered arrays being diffed - the resulting
            // patch should always take A and make it B
            var i, j;
            var LIST_SIZE = 100;
            var NUM_ITERS = 1000;

            for (i = 0; i < NUM_ITERS; ++i) {
                var a = [];
                for (j = 0; j < LIST_SIZE; ++j) {
                    a.push(Math.floor(Math.random() * 100));
                }

                var b = [];
                for (j = 0; j < LIST_SIZE; ++j) {
                    b.push(Math.floor(Math.random() * 100));
                }

                a.sort(function (x, y) { return x - y; });
                b.sort(function (x, y) { return x - y; });

                var A = new Immy.List(a);
                var B = new Immy.List(b);

                var patch = A.compareTo(B, {
                    ordered: true,
                    comparison: function (a, b) {
                        return a - b;
                    }
                });

                var patched = A.withPatchApplied(patch);
                assert.equal(patched.size(), B.size());

                for (j = 0; j < B.size(); ++j) {
                    assert.equal(patched.get(j), B.get(j));
                }
            }
        });

        it('should return a valid diff if disjoint lists are ordered and something compares as the same order but not equal', function () {
            var a = new Immy.List([
                { key: 0, value: 'foo' },
                { key: 1, value: 'bar' },
                { key: 2, value: 'baz' },
            ]);

            var b = new Immy.List([
                { key: 0, value: 'foo' },
                { key: 1, value: 'TEST' },
                { key: 2, value: 'baz' }
            ]);

            var patch = a.compareTo(b, {
                ordered: true,
                comparison: function (a, b) {
                    if (a.key == b.key && a.value != b.value) {
                        return null;
                    }

                    return a.key - b.key;
                }
            });

            var primOps = patch.toPrimitives();
            assert.equal(primOps.length, 2);

            assert(primOps[0] instanceof Immy.ListPatches.Remove);
            assert.equal(primOps[0].index, 1);
            assert.deepEqual(primOps[0].value, { key: 1, value: 'bar' });

            assert(primOps[1] instanceof Immy.ListPatches.Add);
            assert.equal(primOps[1].index, 1);
            assert.deepEqual(primOps[1].value, { key: 1, value: 'TEST' });
        });
    });
});
