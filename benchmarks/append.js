var Benchmark = require('benchmark');
var Immutable = require('immutable');
var seamlessImmutable = require('seamless-immutable');
var seamlessImmutableProduction = require('seamless-immutable/seamless-immutable.production.min');
var ImmyList = require('../src/List');
var suite = new Benchmark.Suite;

var ITERATIONS = 1000;

suite.add('native', function () {
    var list = [];

    for (var i = 0; i < ITERATIONS; ++i) {
        list.push(i);
    }
});

suite.add('Immy', function () {
    var list = new ImmyList();

    for (var i = 0; i < ITERATIONS; ++i) {
        list = list.push(i);
    }
});

suite.add('Immutable.js', function () {
    var list = new Immutable.List();

    for (var i = 0; i < ITERATIONS; ++i) {
        list = list.push(i);
    }
});

// seamless-immutable bans Array.push(), the recommendation is to use concat
// as per https://github.com/rtfeldman/seamless-immutable/issues/43
suite.add('seamless-immutable (production)', function () {
    var list = seamlessImmutableProduction([]);

    for (var i = 0; i < ITERATIONS; ++i) {
        list = list.concat(i);
    }
});

suite.add('seamless-immutable (development)', function () {
    var list = seamlessImmutable([]);

    for (var i = 0; i < ITERATIONS; ++i) {
        list = list.concat(i);
    }
});

module.exports = suite;
