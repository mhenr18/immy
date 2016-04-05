var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#compareTo()', function () {
        it('should return a diff that will result in the same list values when supplied with itself', function () {
            var list = new Immy.List([0, 1, 2]);
            var diff = list.compareTo(list);

            var listWithDiffApplied = list.withPatchesApplied(diff);

            assert.equal(listWithDiffApplied.size(), 3);
            assert.equal(listWithDiffApplied.get(0), 0);
            assert.equal(listWithDiffApplied.get(1), 1);
            assert.equal(listWithDiffApplied.get(2), 2);
        });

        it('should return a diff that will result in the same list values when supplied with a non-related but equivalent list', function () {
            var listA = new Immy.List([0, 1, 2]);
            var listB = new Immy.List([0, 1, 2]);
            var diff = listA.compareTo(listB);

            var listAWithDiffApplied = listA.withPatchesApplied(diff);

            assert.equal(listAWithDiffApplied.size(), 3);
            assert.equal(listAWithDiffApplied.get(0), 0);
            assert.equal(listAWithDiffApplied.get(1), 1);
            assert.equal(listAWithDiffApplied.get(2), 2);
        });
    });
});
