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
    gulp.src(['src/*.js'])
        .pipe(concat('./kui-all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
    
    gulp.src(['src/*.js'])
        .pipe(concat('./kui-all.js'))
        .pipe(gulp.dest('./dist/'));
    
    gulp.src(['src/*.css'])
        .pipe(concat('./kui-all.css'))
        .pipe(gulp.dest('./dist/'));
    
    gulp.src(['src/*.css'])
        .pipe(concat('./kui-all.min.css'))
        .pipe(uglifycss())
        .pipe(gulp.dest('./dist/'));
    
//    gulp.src([
//        'src/kui.css',
//        'src/iconfont.css'])
//        .pipe(concat('./kui-all.css'))
//        .pipe(gulp.dest('./dist/css/'));
//    
//    gulp.src([
//        'src/kui.css',
//        'src/iconfont.css'])
//        .pipe(concat('./kui-all.min.css'))
//        .pipe(uglifycss())
//        .pipe(gulp.dest('./dist/css/'));
//    
//    gulp.src([
//        'src/kui-rsrrz.js',
//        'src/kui-bootstrap.js',
//        'src/kui-dialog.js', 
//        'src/kui-ajax.js', 
//        'src/kui-validation.js',
//        'src/kui-formdata.js',
//        'src/kui-paginationtable.js',
//        'src/kui-hydrograph.js'])
//        .pipe(concat('./kui-all.min.js'))
//        .pipe(uglify())
//        .pipe(gulp.dest('./dist/js/'));
//
//    gulp.src([
//        'src/kui-rsrrz.js',
//        'src/kui-bootstrap.js',
//        'src/kui-dialog.js', 
//        'src/kui-ajax.js', 
//        'src/kui-validation.js',
//        'src/kui-formdata.js',
//        'src/kui-paginationtable.js',
//        'src/kui-hydrograph.js'])
//        .pipe(concat('./kui-all.js'))
//        .pipe(gulp.dest('./dist/js/'));
});

// Default Task
gulp.task('default', function() {
    
});

gulp.task('default', ['compress', 'specs']);