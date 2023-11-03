"use strict";

// Include gulp
var gulp = require('gulp');

// Include plugins
var jasmine = require('gulp-jasmine');
// var jasmineBrowser = require('gulp-jasmine-browser');

var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');
var copy = require('gulp-copy');

gulp.task('dist', function() {
  // desktop js
  gulp.src(['src/js/*.js', 'src/js/application/*.js', 'src/js/container/*.js', 'src/js/control/*.js',
    'src/js/editor/*.js', 'src/js/widget/*.js', 'src/js/diagram/*.js'])
    // .pipe(babel({presets: ['es2015']}))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('./kui-all.min.js'))
    .pipe(uglify({}))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/*.js', 'src/js/application/*.js', 'src/js/container/*.js', 'src/js/control/*.js',
    'src/js/editor/*.js', 'src/js/widget/*.js', 'src/js/diagram/*.js'])
    .pipe(concat('./kui-all.js'))
    .pipe(gulp.dest('./dist/'));

  // tablet js
  gulp.src(['src/js/kui-xhr.js', 'src/js/kui-ajax.js', 'src/js/kui-dialog.js', 'src/js/kui-dom.js',
    'src/js/kui-validation.js', 'src/js/kui-formdata.js', 'src/js/kui-utils.js',
    'src/js/editor/DataSheet.js', 'src/js/container/Tabs.js', 'src/js/container/PaginationGrid.js',
    'src/js/container/Timeline.js', 'src/js/container/ListView.js', 'src/js/container/Wizard.js',
    'src/js/application/Chat.js',
    'src/js/kuit.js'])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('./kui-all.tablet.min.js'))
    .pipe(uglify({}))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/kui-xhr.js', 'src/js/kui-ajax.js', 'src/js/kui-dialog.js', 'src/js/kui-dom.js',
    'src/js/kui-validation.js', 'src/js/kui-formdata.js', 'src/js/kui-utils.js',
    'src/js/editor/DataSheet.js', 'src/js/container/Tabs.js', 'src/js/container/PaginationGrid.js',
    'src/js/container/Timeline.js', 'src/js/container/ListView.js', 'src/js/container/Wizard.js',
    'src/js/application/Chat.js',
    'src/js/kuit.js'])
    .pipe(concat('./kui-all.tablet.js'))
    .pipe(gulp.dest('./dist/'));

  // mobile js
  gulp.src(['src/js/kui-xhr.js', 'src/js/kui-ajax.js', 'src/js/kui-dom.js', 'src/js/kui-utils.js',
    'src/js/kui-dialog.js', 'src/js/container/ListView.js', 'src/js/container/GridView.js',
    'src/js/container/Timeline.js', 'src/js/container/Tabs.js', 'src/js/editor/DataSheet.js',
    'src/js/application/Chat.js', 'src/js/widget/Sparkline.js', 'src/js/widget/Ruler.js',
    'src/js/container/MobileWizard.js', 'src/js/container/MobileForm.js',
    'src/js/mobile/Numpad.js', 'src/js/mobile/DistrictPicker.js', 'src/js/mobile/Calendar.js',
    'src/js/mobile/CascadePicker.js', 'src/js/mobile/ActionSheet.js', 'src/js/mobile/Weekdays.js',
    'src/js/mobile/PopupRuler.js',
    'src/js/kuim.js', 'src/js/flutter.js'])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('./kui-all.mobile.min.js'))
    .pipe(uglify({}))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/kui-xhr.js', 'src/js/kui-ajax.js', 'src/js/kui-dom.js', 'src/js/kui-utils.js',
    'src/js/kui-dialog.js', 'src/js/container/ListView.js', 'src/js/container/GridView.js',
    'src/js/container/Timeline.js', 'src/js/container/Tabs.js', 'src/js/editor/DataSheet.js',
    'src/js/application/Chat.js', 'src/js/widget/Sparkline.js', 'src/js/widget/Ruler.js',
    'src/js/container/MobileWizard.js', 'src/js/container/MobileForm.js',
    'src/js/mobile/Numpad.js', 'src/js/mobile/DistrictPicker.js', 'src/js/mobile/Calendar.js',
    'src/js/mobile/CascadePicker.js', 'src/js/mobile/ActionSheet.js', 'src/js/mobile/Weekdays.js',
    'src/js/mobile/PopupRuler.js',
    'src/js/kuim.js', 'src/js/flutter.js'])
    .pipe(concat('./kui-all.mobile.js'))
    .pipe(gulp.dest('./dist/'));

  // desktop css
  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kui.css', 'src/css/kui-*.css'])
    .pipe(concat('./kui-all.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kui.css', 'src/css/kui-*.css'])
      .pipe(concat('./kui-all.min.css'))
      .pipe(uglifycss())
      .pipe(gulp.dest('./dist/'));

  // tablet css
  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kui.css', 'src/css/kuit.css',
    'src/css/kui-chat.css', 'src/css/kui-timeline.css', 'src/css/kui-wizard.css',])
    .pipe(concat('./kui-all.tablet.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kui.css', 'src/css/kuit.css',
    'src/css/kui-chat.css', 'src/css/kui-timeline.css', 'src/css/kui-wizard.css',])
    .pipe(concat('./kui-all.tablet.min.css'))
    .pipe(uglifycss())
    .pipe(gulp.dest('./dist/'));

  // mobile css
  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kuim.css',
    'src/css/kui-timeline.css', 'src/css/kui-wizard.css', 'src/css/kui-tag.css',
    'src/css/kui-calendar.css', 'src/css/kui-chat.css', 'src/css/kui-skeleton.css'])
    .pipe(concat('./kui-all.mobile.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/css/coreui.css', 'src/css/coreui3-c.css', 'src/css/kuim.css',
    'src/css/kui-timeline.css', 'src/css/kui-wizard.css', 'src/css/kui-tag.css',
    'src/css/kui-calendar.css', 'src/css/kui-chat.css', 'src/css/kui-skeleton.css'])
    .pipe(concat('./kui-all.mobile.min.css'))
    .pipe(uglifycss())
    .pipe(gulp.dest('./dist/'));
});

// gulp.task('default', ['compress', 'specs']);
gulp.task('dist');