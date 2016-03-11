var Benchmark = require('benchmark');
global.require = require;

var suites = [
    require('./push'),
    require('./pop')
];

function runSuite(suite) {
    suite.on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('error', function (event) {
        console.log('error', event);
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();
}

if (process.argv.length >= 3) {
    // run specific suite
    suites.forEach(function (suite) {
        if (suite.name != process.argv[2]) {
            return;
        }

        console.log('\nrunning ' + suite.name);
        runSuite(suite);
    });
} else {
    // run all suites
    suites.forEach(function (suite) {
        console.log('\nrunning ' + suite.name);
        runSuite(suite);
    });
}
