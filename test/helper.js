require('dotenv').config();
const webdriver = require('selenium-webdriver');

function getDriver() {
  const capabilities = {
    browserName: "chrome",
    chromeOptions: {
      prefs: {
        'downloads': {
          'prompt_for_download': false
        }
      },
      args: [
        '--window-size=1920,1080',
        '--start-maximized'
      ]
    }
  };

  if (process.env.SAUCE_USERNAME !== undefined) {
    return new webdriver.Builder()
      .usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        ...capabilities
      }).build();
  } else {
    return new webdriver.Builder()
      .withCapabilities(capabilities).build();
  }
}

module.exports = {
  getDriver
}
