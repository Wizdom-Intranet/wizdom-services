const {resolve} = require('path');

module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            //'test/**/*.js'  
            {
                pattern: resolve('./tests/test.js'),
                type: 'module',
                included: true,
                served: true
            }
        ],
        reporters: ['progress'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['MyHeadlessChrome'],
        autoWatch: true,
        // singleRun: false, // Karma captures browsers, runs the tests and exits
        concurrency: Infinity,
        customLaunchers: {
            MyHeadlessChrome: {
                base: 'ChromeHeadless',
                flags: ['--disable-translate', '--disable-extensions']
            }
        },
    })
}