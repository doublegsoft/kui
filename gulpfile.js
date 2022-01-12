"use strict";

// Include gulp
var gulp = require('gulp');

// Include plugins
var jasmine = require('gulp-jasmine');
// var jasmineBrowser = require('gulp-jasmine-browser');

var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');
var copy = require('gulp-copy');

// Test JS
gulp.task('specs', function () {
  /*
  return gulp.src(['./3rd/js/jquery-3.2.0.min.js', './src/kui-validation.js', './spec/*.js'])
      .pipe(jasmineBrowser.specRunner({console: true}))
      .pipe(jasmineBrowser.server({port: 8888}));
  */
});

gulp.task('compress', function() {
  // uglify js
  gulp.src(['src/js/*.js'])
      .pipe(concat('./kui-all.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist/'));
  
  gulp.src(['src/js/*.js'])
      .pipe(concat('./kui-all.js'))
      .pipe(gulp.dest('./dist/'));
  
  // uglify css
  gulp.src(['src/css/*.css'])
      .pipe(concat('./kui-all.css'))
      .pipe(gulp.dest('./dist/'));
  
  gulp.src(['src/css/*.css'])
      .pipe(concat('./kui-all.min.css'))
      .pipe(uglifycss())
      .pipe(gulp.dest('./dist/'));
});

// Default Task
gulp.task('default', function() {
    
});

// gulp.task('default', ['compress', 'specs']);
gulp.task('compress');