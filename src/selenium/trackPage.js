var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;

var TrackPage = Object.create(BasePage);

// Get number of visible tracks on the page
TrackPage.getNumTracksVisible = function() {
  var self = this;
  var numPromise = new Promise(function(resolve) {
    self.findAll(By.className('track-filter')).then(function(trackElems) {
      var counter = 0;
      var trackNameArr = [];

      trackElems.forEach(function(trackElem) {
        trackElem.isDisplayed().then(function(val) {
          trackElem.findElement(By.className('text')).getText().then(function(name) {
            if (val && trackNameArr.indexOf(name) === -1) {
              trackNameArr.push(name);
            }
            counter += 1;
            if (counter === trackElems.length) {
              resolve(trackNameArr.length);
            }
          });
        });
      });
    });
  });

  return numPromise;
};

TrackPage.checkSharableUrl = function() {
  var self = this;
  var speakerId = '3014';

  var promise = new Promise(function(resolve) {
    self.find(By.id(speakerId)).click().then(function() {
      self.find(By.className('clickable-link')).click().then(self.driver.sleep(1000)).then(function() {
        var link = self.find(By.className('speakers-inputbox')).getAttribute('value');

        self.find(By.id(speakerId)).click().then(self.driver.sleep(1000)).then(function() {
          resolve(link);
        });
      });
    });
  });

  return promise;
};

TrackPage.checkIsolatedBookmark = function() {
  // Sample sessions having ids of 3014 and 3015 being checked for the bookmark feature
  var self = this;
  var bookmarkSessionsIdsArr = ['3014', '3015', '2907'];
  var visibleCheckSessionsIdsArr = ['3014', '3015', '2918', '2907'];

  return self.bookmarkCheck(bookmarkSessionsIdsArr, visibleCheckSessionsIdsArr);
};

// Clicks on the Open Tech Track and then returns the number of visible tracks present on the page
TrackPage.checkIsolatedTrackFilter = function() {
  var self = this;

  return self.find(By.className('track-room-names')).findElements(By.className('track-name')).then(function(elems) {
    // Clicking on the Open Tech Track
    return elems[16].click().then(self.getNumTracksVisible.bind(self));
  });
};

TrackPage.toggleSessionElem = function() {
  var self = this;

  // Checking the toggle behaviour of session having id 3014
  var promise = new Promise(function(resolve) {
    self.find(By.id('title-3014')).then(self.click).then(self.driver.sleep(1000)).then(function() {
      var promiseArr = [];
      promiseArr.push(self.find(By.id('desc-3014')).isDisplayed());
      promiseArr.push(self.find(By.id('desc2-3014')).isDisplayed());
      resolve(Promise.all(promiseArr));
    });
  });

  return promise;
};

/* Below is the list of selected sessions which are to be tested for visiblity. Sessions having ids 3014, 3015, 3018, 2938 are
of Open Tech Track. The former two are in bookmarked state. Session id 2907 is of Track Hardware and Making and the last session
with id 2941 is of Database Track. */

var idArr = ['3014', '3015', '3018', '2938', '2907', '2941'];

// Get the visibility status of the selected sessions on enabling and disabling the track filter.
TrackPage.filterThenSessionStatus = function(choice) {
  var self = this;
  var promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  var statusPromise = new Promise(function(resolve) {
    if (choice === 'true') {
      // Applying track filter
      self.find(By.className('track-room-names')).findElements(By.className('track-name')).then(function(elems) {
        // Clicking on the Open Tech Track
        elems[16].click().then(self.getElemsDisplayStatus.bind(null, promiseArr)).then(function(ans) {
          self.driver.sleep(1000).then(function() {
            resolve(ans);
          });
        });
      });
    } else {
      // Removing applied track filter
      self.find(By.id('clearFilter')).click().then(self.getElemsDisplayStatus.bind(null, promiseArr)).then(function(ans) {
        self.driver.sleep(1000).then(function() {
          resolve(ans);
        });
      });
    }
  });

  return statusPromise;
};

// Get the visibility status of the selected sessions after search
TrackPage.searchThenSessionStatus = function(text) {
  var self = this;
  var promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  return self.resetSearchBar().then(self.search.bind(self, text)).then(self.getElemsDisplayStatus.bind(null, promiseArr));
};

// Get the visibility status of the selected sessions after toggling the bookmark button
TrackPage.starredThenSessionStatus = function() {
  var self = this;
  var promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  return self.toggleStarredButton().then(self.getElemsDisplayStatus.bind(null, promiseArr));
};

// Takes in an array of filters, apply them sequentially and send visibility results of selected sessions on each filter
TrackPage.filterCombination = function(filtersArr) {
  var self = this;
  var filterObjectFunc = {
    'trackselect': function() {
      return self.filterThenSessionStatus('true');
    },

    'trackunselect': function() {
      return self.filterThenSessionStatus('false');
    },

    'search': function() {
      return self.searchThenSessionStatus('wel');
    },

    'unsearch': function() {
      return self.searchThenSessionStatus('');
    },

    'starred': function() {
      return self.starredThenSessionStatus();
    },

    'unstarred': function() {
      return self.starredThenSessionStatus();
    }
  };

  var serialPromise = function series(arrayOfPromises) {
    var results = [];

    return arrayOfPromises.reduce(function(seriesPromise, promise) {
      return seriesPromise.then(function() {
        return promise.then(function(result) {
          results.push(result);
        });
      });
    }, Promise.resolve()).then(function() {
      return results;
    });
  };

  var filtersArrProm = [];

  filtersArrProm = filtersArr.map(function(filter) {
    return filterObjectFunc[filter]();
  });

  return serialPromise(filtersArrProm);
};

module.exports = TrackPage;
