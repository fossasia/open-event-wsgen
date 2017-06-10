'use strict';
var tabs, i, myTabs;

tabs = function(options) {
  var goToTab, handleClick, init;
  var el = $(options.el);
  var tabNavigationLinks = $(el).find(options.tabNavigationLinks);
  var tabContentContainers = $(el).find(options.tabContentContainers);
  var activeIndex = -1;
  var initCalled = false;
  var date = $('.date-filter').first();

  goToTab = function(index) {
    if (index !== activeIndex && index >= 0 && index <= tabNavigationLinks.length) {
      if(activeIndex >= 0) {
        $(tabNavigationLinks[activeIndex]).removeClass('is-active');
        $(tabContentContainers[activeIndex]).removeClass('is-active');
      }
      date = $('.' + $(tabNavigationLinks[index]).attr('id'));
      $('.date-filter').addClass('hide');
      $(date).removeClass('hide');
      $(tabNavigationLinks[index]).addClass('is-active');
      $(tabContentContainers[index]).addClass('is-active');
      activeIndex = index;
    }
  };
  handleClick = function(link, index) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      goToTab(index);
    });
  };
  init = function() {
    var link;
    $(date).show();

    if (!initCalled) {
      initCalled = true;
      $(el).removeClass('no-js');
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
