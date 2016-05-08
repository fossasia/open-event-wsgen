// Karma configuration
// Generated on Fri May 06 2016 17:58:51 GMT+0530 (IST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        './bower_components/angular/angular.js',
        './bower_components/angular-mocks/angular-mocks.js',
        './bower_components/leaflet/leaflet.*',
        './bower_components/**/angular-simple-logger.js',
        './bower_components/**/angular-animate.js',
        './bower_components/**/angular-aria.js',
        './bower_components/**/angular-leaflet-directive.js',
        './bower_components/**/angular-material.js',
        './bower_components/**/angular-material.css',
        './bower_components/**/angular-ui-router.js',
        './bower_components/**/ngStorage.js',
        './src/app.js',
        './src/config.js',
        './src/appComponents/**/*',
        './src/test/unit/spec1.js',
         './src/appComponents/common/TwitterJsonFactory.js',
        './src/test/unit/tweetspec1.js'
     ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
