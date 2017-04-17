'use strict';
var tabs, i, myTabs;

tabs = function(options) {
  var goToTab, handleClick, init, handleDisplay;
  var el = document.querySelector(options.el);
  var tabNavigationLinks = el.querySelectorAll(options.tabNavigationLinks);
  var tabContentContainers = el.querySelectorAll(options.tabContentContainers);
  var activeIndex = -1;
  var initCalled = false;

  goToTab = function(index) {
    if (index !== activeIndex && index >= 0 && index <= tabNavigationLinks.length) {
      if(activeIndex >= 0) {
        tabNavigationLinks[activeIndex].classList.remove('is-active');
        if(typeof tabContentContainers[index] != 'undefined')
          tabContentContainers[activeIndex].classList.remove('is-active');
      }
      tabNavigationLinks[index].classList.add('is-active');
      if(typeof tabContentContainers[index] != 'undefined')
        tabContentContainers[index].classList.add('is-active');
      
      handleDisplay(tabNavigationLinks[index].className);
      activeIndex = index;
    }
  };
  handleClick = function(link, index) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      goToTab(index);
    });
  };
  handleDisplay = function(className) {
    className = className.split(' ')[0];
    var dates = document.getElementsByClassName('date-filter');
    for(i =0; i< dates.length; i++) {
      if(dates[i].classList.contains(className)) {
        dates[i].classList.remove('hide-item');
        dates[i].classList.add('show-item');
      } else {
        dates[i].classList.add('hide-item');
        dates[i].classList.remove('show-item');
      }
    }
  }
  init = function() {
    var link;

    if (!initCalled) {
      initCalled = true;
      el.classList.remove('no-js');
      for (i = 0; i < tabNavigationLinks.length; i++) {
        link = tabNavigationLinks[i];
        handleClick(link, i);
      }
    }
  };

  return {
    init: init,
    goToTab: goToTab
  };
};
window.tabs = tabs;
myTabs = tabs({
  el: '#tabs',
  tabNavigationLinks: '.tabs-nav-link',
  tabContentContainers: '.tab'
});
myTabs.init();
