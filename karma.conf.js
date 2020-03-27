process.env.CHROME_BIN = require('puppeteer').executablePath()
module.exports = function(config) {
    config.set({
  
      basePath: '',
      frameworks: ['jasmine'],
      files: [
        './unit-testing/tests/*.js'
      ],
      exclude: [
      ],
      preprocessors: {
      },
      reporters: ['progress'],
      // web server port
      port: 9876,
      // enable / disable colors in the output (reporters and logs)
      colors: true,
  
  
      // level of logging
      // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
      logLevel: config.LOG_INFO,
      // enable / disable watching file and executing tests whenever any file changes
      autoWatch: false,
      // start these browsers
      browsers: ['ChromeHeadless'],
  
  
      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun: false,
  
      // Concurrency level
      // how many browser should be started simultaneous
      concurrency: Infinity
    })
  }