var Benchmark = require('benchmark');

var suites = [
    require('./append')
];

function runSuite(suite) {
    suite.on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();
}

runSuite(suites[0]);
