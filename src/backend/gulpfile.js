/* eslint-disable no-empty-label */
'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const minify = require('gulp-minify-css');
const htmlmin = require('gulp-htmlmin');
const iife = require('gulp-iife');
const del = require('del');
// eslint-disable-next-line no-var
var exports = module.exports = {};

exports.minifyJs = function(path, cb) {
  const dir = path + '/js/';

  function minifyPipeline(dist, src) {
    return gulp.src(src.map(file => dir + file))
      .pipe(iife({useStrict: false}))
      .pipe(concat(dist + '.min.js'))
      .pipe(babel({presets: ['@babel/preset-env']}))
      .pipe(uglify().on('error', function(e) {
        console.log(`Error while compiling ${dist}.js` + e);
      }))
      .pipe(gulp.dest(path + '/js/'));
  }

  function scheduleJs() {
    return minifyPipeline('schedule', [
      'FileSaver.js',
      'social.js',
      'scroll.js',
      'navbar.js',
      'popover.js',
      'html2canvas.js',
      'jquery.lazyload.js',
      'icsGen.js'
    ])
  }

  function tracksJs() {
    return minifyPipeline('tracks', ['social.js', 'scroll.js', 'navbar.js', 'jquery.lazyload.js']);
  }

  function eventJs() {
    return minifyPipeline('event', ['map.js', 'scroll.js', 'navbar.js', 'popover.js', 'loklak-fetcher.js', 'tweets.js', 'jquery.lazyload.js']);
  }

  function roomsJs() {
    return minifyPipeline('rooms', ['social.js', 'scroll.js', 'navbar.js', 'jquery.lazyload.js']);
  }

  function speakersJs() {
    return minifyPipeline('speakers', ['social.js', 'scroll.js', 'navbar.js', 'popover.js', 'jquery.lazyload.js']);
  }

  function sessionJs() {
    return minifyPipeline('session', ['session.js', 'social.js']);
  }

  function mainJs() {
    return minifyPipeline('main', ['main.js']);
  }

  gulp.task('minifyJs', gulp.series(gulp.parallel(speakersJs, roomsJs, scheduleJs, eventJs, tracksJs, sessionJs, mainJs), async function() {
    await del([dir + '*.js', '!' + dir + '*.min.js']);
    cb();
  }));

  gulp.series('minifyJs')();
};

exports.minifyCss = function(path, cb) {
  // Minify all the css files of the web-app
  return gulp.src(path + '/css/*.css')
    .pipe(minify())
    .pipe(gulp.dest(path + '/css')).on('end', function() {
      cb();
    });
};

exports.minifyHtml = function(path, cb) {
  // Minify all the html files of the web-app
  return gulp.src(path + '/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(path)).on('end', function() {
      cb();
    });
};
