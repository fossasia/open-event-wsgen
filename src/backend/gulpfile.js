var gulp = require('gulp');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');
var iife = require('gulp-iife');
var clean = require('gulp-clean');
var swPrecache = require('sw-precache');
var exports = module.exports = {};

exports.minifyJs = function (path, cb) {
  var dir = path + "/js/";

  gulp.task('scheduleJs', function() {

    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'calendar.js', dir + 'popover.js',  dir + 'jquery.lazyload.js'])
    .pipe(iife({ useStrict : false}))
    .pipe(concat('schedule.min.js'))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify().on('error', function(e) {
        console.log("Error while compiling schedule.js");
    }))
    .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('tracksJs', function() {

    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'tabs.js', dir + 'jquery.lazyload.js'])
    .pipe(iife({ useStrict : false}))
    .pipe(concat('tracks.min.js'))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify().on('error', function(e) {
        console.log("Error while compiling tracks.js");
    }))
    .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('eventJs', function() {

    return gulp.src([dir + 'map.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'popover.js', dir + 'loklak-fetcher.js', dir + 'tweets.js', dir + 'jquery.lazyload.js'])
    .pipe(iife({ useStrict : false}))
    .pipe(concat('event.min.js'))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify().on('error', function(e) {
        console.log("Error while compiling event.js");
    }))
    .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('roomsJs', function() {

    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'tabs.js', dir + 'jquery.lazyload.js'])
    .pipe(iife({ useStrict : false}))
    .pipe(concat('rooms.min.js'))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify().on('error', function(e) {
        console.log("Error while compiling rooms.js");
    }))
    .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('speakersJs', function() {

    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'popover.js', dir + 'jquery.lazyload.js'])
    .pipe(iife({ useStrict : false}))
    .pipe(concat('speakers.min.js'))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify().on('error', function(e) {
        console.log("Error while compiling speakers.js");
    }))
    .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('minifyJs',['speakersJs', 'roomsJs', 'scheduleJs', 'eventJs', 'tracksJs'], function() {
    gulp.src(['!' + dir + '*.min.js', dir + "*.js"])
    .pipe(clean())
    cb();
  });

  gulp.start('minifyJs');
};

exports.minifyCss = function (path, cb) {
  gulp.task('minifyCss', function() {
    //Minify all the css files of the web-app
    return gulp.src(path + '/css/*.css')
    .pipe(minify())
    .pipe(gulp.dest(path + '/css')).on('end', function() {
      cb();
    });
  });

  gulp.start('minifyCss');
};

exports.minifyHtml = function (path,wrk,cb) {
  gulp.task('minifyHtml', function() {
    //Minify all the html files of the web-app
    return gulp.src(path + '/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(path)).on('end', function() {
      cb();
    })
  });

  gulp.task('generate-service-worker', function() {
    swPrecache.write(path + '/service-worker.js', {
      staticFileGlobs: [wrk + '/**/*.{html,css,png,jpg,gif,svg,eot,ttf,woff}', wrk + '/*.html', wrk + '/**/*.min.js'],
/*      stripPrefixMulti: {
          path
      }*/
    });
    return gulp.src(path + '/service-worker.js')
    .pipe(iife({ useStrict : false}))
    .pipe(concat('service-worker.min.js'))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify().on('error', function(e) {
        console.log("Error while compiling service-worker.js");
    }))
    .pipe(gulp.dest(path + '/'));
  });

  var dir = path + '.';
  gulp.task('minifyHtml',['generate-service-worker'], function() {
    gulp.src(['!' + dir + '*.min.js', dir + "*.js"])
    .pipe(clean())
    cb();
  });

  gulp.start('minifyHtml');
};
