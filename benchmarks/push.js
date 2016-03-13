var Benchmark = require('benchmark');
var suite = new Benchmark.Suite('push');

suite.add('native', {
    setup: function () {
        var arr = [];
    },
    fn: function () {
        arr.push(1);
    }
});

suite.add('Immy', {
    setup: function () {
        var Immy = require('../src/Immy');
        var list = new Immy.List();
    },
    fn: function () {
        list = list.push(1);
    }
});

suite.add('mori', {
    setup: function () {
        var mori = require('mori');
        var vec = mori.vector();
    },
    fn: function () {
        vec = mori.conj(vec, 1);
    }
});

suite.add('Immutable.js', {
    setup: function () {
        var Immutable = require('immutable');
        var list = new Immutable.List();
    },
    fn: function () {
        list = list.push(1);
    }
});

// seamless-immutable bans Array.push(), the recommendation is to use concat
// as per https://github.com/rtfeldman/seamless-immutable/issues/43
suite.add('seamless-immutable (production)', {
    setup: function () {
        var Immutable = require('seamless-immutable/seamless-immutable.production.min');
        var list = Immutable([]);
    },
    fn: function () {
        list = list.concat(1);
    }
});

suite.add('seamless-immutable (development)', {
    setup: function () {
        var Immutable = require('seamless-immutable');
        var list = Immutable([]);
    },
    fn: function () {
        list = list.concat(1);
    }
});

module.exports = suite;
