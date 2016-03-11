var Benchmark = require('benchmark');
var suite = new Benchmark.Suite('pop');

suite.add('native', {
    setup: function () {
        var arr = [];

        for (var i = 0; i < this.count; ++i) {
            arr.push(i);
        }

        var list = arr;
    },
    fn: function () {
        list.pop();
    }
});

suite.add('Immy', {
    setup: function () {
        var Immy = require('../src/immy');
        var arr = [];

        for (var i = 0; i < this.count; ++i) {
            arr.push(i);
        }

        var list = new Immy.List(arr);
    },
    fn: function () {
        list = list.pop();
    }
});

suite.add('Immutable', {
    setup: function () {
        var Immutable = require('immutable');
        var arr = [];

        for (var i = 0; i < this.count; ++i) {
            arr.push(i);
        }

        var list = new Immutable.List(arr);
    },
    fn: function () {
        list = list.pop();
    }
});

// seamless-immutable bans Array.pop(), without a stated recommendation we use
// Array.slice to get the same effect. if there's a faster way to do this then
// please change this! (seamless-immutable is already really slow, we don't need
// to try and cheat the benchmark somehow by using a deliberately slow call)
suite.add('seamless-immutable (production)', {
    setup: function () {
        var Immutable = require('seamless-immutable/seamless-immutable.production.min');
        var arr = [];

        for (var i = 0; i < this.count; ++i) {
            arr.push(i);
        }

        var list = Immutable(arr);
    },
    fn: function () {
        list = list.slice(0, -1);
    }
});

suite.add('seamless-immutable (development)', {
    setup: function () {
        var Immutable = require('seamless-immutable');
        var arr = [];

        for (var i = 0; i < this.count; ++i) {
            arr.push(i);
        }

        var list = Immutable(arr);
    },
    fn: function () {
        list = list.slice(0, -1);
    }
});

module.exports = suite;
