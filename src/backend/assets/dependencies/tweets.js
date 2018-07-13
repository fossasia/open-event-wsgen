var interval_id = null;
var tweetP = document.getElementById('tweet');
var dateOfTweet = document.getElementById("dateTweeted");
var tweetsEl = document.getElementById('tweets');
var stuff = null;

function interval() {
  if (interval_id !== null){
    clearInterval(interval_id);
    interval_id = window.setInterval(nextTweet, 6600); //6.6 secs
  } else{
    interval_id = window.setInterval(nextTweet, 6600); //6.6 secs
  }
}

var datafetcher = function () {
  if(tweetP === null) {
    return;
  }
  let config = {
    "profile": {"screenName": tweetsEl.dataset.query},
    "showRetweet": true,
    "customCallback": datahandler,
    "lang": 'en',
    "dataOnly": true,
  };

  twitterFetcher.fetch(config);
};

function datahandler(raw) {
  stuff = raw;   // Makes the data available globally.
  parser(stuff);
  interval();
}

var tweetNum = 0;

function parseFunc(){
  parser(stuff);
}

function nextTweet() {
  tweetNum += 1;
  //go back to the first tweet if it's greater than the amount of tweets available
  if(tweetNum == stuff.length) {
    tweetNum = 0;
  }
  interval();
  tweetP.style.opacity = 0;
  dateOfTweet.style.opacity = 0;
  window.setTimeout(parseFunc, 560);
}

function lastTweet() {
  if (tweetNum > 0) {
    tweetNum -= 1;
    interval();
    tweetP.style.opacity = 0;
    dateOfTweet.style.opacity = 0;
    window.setTimeout(parseFunc, 560);
  }
}

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

function parser(data) {
  try{
    let tweet = data[tweetNum].tweet;
    let tweetDate = new Date(data[tweetNum].time);

    tweetP.innerHTML = tweet;
    if(tweetDate == 'Invalid Date'){
      let time = data[tweetNum].time;

      dateOfTweet.innerHTML = "Tweeted " + time + " ago";
    } else{
      dateOfTweet.innerHTML = "Tweeted " + timeSince(tweetDate) + " ago";
    }
    tweetP.style.opacity = 1;
    dateOfTweet.style.opacity = 1;
  }catch(err){
    tweetP.innerHTML = "No Tweets Available";
    tweetP.style.opacity = 1;
  }
}

window.datafetcher = datafetcher;
