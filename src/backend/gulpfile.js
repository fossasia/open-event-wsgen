/* eslint-disable no-empty-label */
'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const minify = require('gulp-minify-css');
const htmlmin = require('gulp-htmlmin');
const iife = require('gulp-iife');
const clean = require('gulp-clean');
// eslint-disable-next-line no-var
var exports = module.exports = {};

exports.minifyJs = function(path, cb) {
  const dir = path + '/js/';

  gulp.task('scheduleJs', function() {
    return gulp.src([dir + 'FileSaver.js', dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'calendar.js', dir + 'popover.js', dir + 'html2canvas.js', dir + 'jquery.lazyload.js', dir + 'icsGen.js'], {allowEmpty: true})
      .pipe(iife({useStrict: false}))
      .pipe(concat('schedule.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling schedule.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('tracksJs', function() {
    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'jquery.lazyload.js'])
      .pipe(iife({useStrict: false}))
      .pipe(concat('tracks.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling tracks.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('eventJs', function() {
    return gulp.src([dir + 'map.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'popover.js', dir + 'loklak-fetcher.js', dir + 'tweets.js', dir + 'jquery.lazyload.js'])
      .pipe(iife({useStrict: false}))
      .pipe(concat('event.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling event.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('roomsJs', function() {
    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'jquery.lazyload.js'])
      .pipe(iife({useStrict: false}))
      .pipe(concat('rooms.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling rooms.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('speakersJs', function() {
    return gulp.src([dir + 'social.js', dir + 'scroll.js', dir + 'navbar.js', dir + 'popover.js', dir + 'jquery.lazyload.js'])
      .pipe(iife({useStrict: false}))
      .pipe(concat('speakers.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling speakers.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('sessionJs', function() {
    return gulp.src([dir + 'session.js', dir + 'social.js'])
      .pipe(iife({useStrict: false}))
      .pipe(concat('session.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling session.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });
  gulp.task('mainJs', function() {
    return gulp.src([dir + 'main.js'])
      .pipe(iife({useStrict: false}))
      .pipe(concat('main.min.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify().on('error', function(e) {
        console.log('Error while compiling main.js' + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  });

  gulp.task('minifyJs', gulp.series('speakersJs', 'roomsJs', 'scheduleJs', 'eventJs', 'tracksJs', 'sessionJs', 'mainJs', function() {
    gulp.src(['!' + dir + '*.min.js', dir + '*.js']).pipe(clean());
    cb();
  }));

  gulp.series('minifyJs')();
};

exports.minifyCss = function(path, cb) {
  gulp.task('minifyCss', function() {
    // Minify all the css files of the web-app
    return gulp.src(path + '/css/*.css')
      .pipe(minify())
      .pipe(gulp.dest(path + '/css')).on('end', function() {
        cb();
      });
  });

  gulp.series('minifyCss')();
};

exports.minifyHtml = function(path, cb) {
  gulp.task('minifyHtml', function() {
    // Minify all the html files of the web-app
    return gulp.src(path + '/*.html')
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest(path)).on('end', function() {
        cb();
      });
  });

  gulp.series('minifyHtml')();
};
