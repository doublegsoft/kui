"use strict";

// Include gulp
var gulp = require('gulp');

// Include plugins
var jasmine = require('gulp-jasmine');
// var jasmineBrowser = require('gulp-jasmine-browser');

var uglify = require('gulp-uglifyes');
var babel = require('gulp-babel');
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

gulp.task('dist', function() {
  // uglify js
  gulp.src(['src/js/*.js', 'src/js/application/*.js', 'src/js/container/*.js', 'src/js/control/*.js',
    'src/js/editor/*.js', 'src/js/widget/*.js'])
    // .pipe(babel({presets: ['es2015']}))
    .pipe(concat('./kui-all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/*.js', 'src/js/application/*.js', 'src/js/container/*.js', 'src/js/control/*.js',
    'src/js/editor/*.js', 'src/js/widget/*.js'])
    .pipe(concat('./kui-all.js'))
    .pipe(gulp.dest('./dist/'));
  
  // uglify css
  // gulp.src(['src/css/*.css'])
  //     .pipe(concat('./kui-all.css'))
  //     .pipe(gulp.dest('./dist/'));
  
  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kui.css', 'src/css/kui-*.css'])
      .pipe(concat('./kui-all.min.css'))
      .pipe(uglifycss())
      .pipe(gulp.dest('./dist/'));
});

// Default Task
gulp.task('default', function() {
    
});

// gulp.task('default', ['compress', 'specs']);
gulp.task('dist');