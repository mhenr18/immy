var assert = require('assert');
var Immy = require('../../src/immy');

describe('List', function () {
    describe('#push()', function () {
        it('should return a new list with the given value at the end', function () {
            var list = new Immy.List();
            var pushed = list.push(5);

            assert.notEqual(list, pushed);
            assert.equal(pushed.size(), 1);
            assert.equal(pushed.get(0), 5)
        });

        it('should not modify the original list', function () {
            var list = new Immy.List();
            list.push('foo');

            assert.equal(list.size(), 0);
        });

        it('should not modify the original list, even if that list is not empty', function () {
            var a = new Immy.List();
            var b = a.push('foo');
            var c = b.push('bar');
            var d = c.push('baz');

            assert.equal(a.size(), 0);

            assert.equal(b.size(), 1);
            assert.equal(b.get(0), 'foo');

            assert.equal(c.size(), 2);
            assert.equal(c.get(0), 'foo');
            assert.equal(c.get(1), 'bar');

            assert.equal(d.size(), 3);
            assert.equal(d.get(0), 'foo');
            assert.equal(d.get(1), 'bar');
            assert.equal(d.get(2), 'baz');
        });

        it('should not modify existing items in the list', function () {
            var a = new Immy.List();
            var b = a.push('foo');
            var c = b.push('bar');
            var d = c.push('baz');

            assert.equal(b.get(0), c.get(0));
            assert.equal(b.get(0), d.get(0));
            assert.equal(c.get(1), d.get(1));
        });
    });
});
