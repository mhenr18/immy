var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#slice()', function () {
        it('should return the same list when called with no arguments', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl']);
            var cpy = list.slice();

            assert.equal(cpy, list);
        });

        it('should return the same list when called with a begin of zero and no end', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl']);
            var cpy = list.slice(0);

            assert.equal(cpy, list);
        });

        it('should work correctly with a positive begin index and no end', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl']);
            var cpy1 = list.slice(1);
            var cpy2 = list.slice(2);
            var cpy3 = list.slice(3);

            assert.equal(cpy1.size(), 3);
            assert.equal(cpy1.get(0), list.get(1));
            assert.equal(cpy1.get(1), list.get(2));
            assert.equal(cpy1.get(2), list.get(3));

            assert.equal(cpy2.size(), 2);
            assert.equal(cpy2.get(0), list.get(2));
            assert.equal(cpy2.get(1), list.get(3));

            assert.equal(cpy3.size(), 1);
            assert.equal(cpy3.get(0), list.get(3));
        });

        it('should work with a negative begin index and no end', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl']);
            var cpy = list.slice(-2);

            assert.equal(cpy.size(), 2);
            assert.equal(cpy.get(0), 'ghi');
            assert.equal(cpy.get(1), 'jkl');
        });

        it('should work with a positive begin and end index', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.slice(2, 4);

            assert.equal(cpy.size(), 2);
            assert.equal(cpy.get(0), 'ghi');
            assert.equal(cpy.get(1), 'jkl');
        });

        it('should work with begin = 0 and a given end index', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.slice(0, 4);

            assert.equal(cpy.size(), 4);
            assert.equal(cpy.get(0), 'abc');
            assert.equal(cpy.get(1), 'def');
            assert.equal(cpy.get(2), 'ghi');
            assert.equal(cpy.get(3), 'jkl');
        });

        it('should work with a negative begin and positive end index', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.slice(-3, 4);

            assert.equal(cpy.size(), 2);
            assert.equal(cpy.get(0), 'ghi');
            assert.equal(cpy.get(1), 'jkl');
        });

        it('should work with a negative begin and negative end index', function () {
            var list = new Immy.List(['abc', 'def', 'ghi', 'jkl', 'mno']);
            var cpy = list.slice(-4, -1);

            assert.equal(cpy.size(), 3);
            assert.equal(cpy.get(0), 'def');
            assert.equal(cpy.get(1), 'ghi');
            assert.equal(cpy.get(2), 'jkl');
        });
    });
});
