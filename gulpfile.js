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

// Test JS
gulp.task('specs', function () {
  /*
  return gulp.src(['./3rd/js/jquery-3.2.0.min.js', './src/kui-validation.js', './spec/*.js'])
      .pipe(jasmineBrowser.specRunner({console: true}))
      .pipe(jasmineBrowser.server({port: 8888}));
  */
});

gulp.task('dist', function() {
  // desktop 3rd
  // gulp.src([
  //   '3rd/vue/vue@2.js',
  //   '3rd/vue/index.js',
  //   '3rd/jquery/jquery-3.2.1.min.js',
  //   '3rd/bootstrap/js/bootstrap.bundle.min.js',
  //   '3rd/moment/moment.min.js',
  //   '3rd/rxjs/rxjs.umd.js',
  //   '3rd/rxjs/rxjs-pubsub.js',
  //   '3rd/echarts/echarts.min.js',
  //   '3rd/layer/layer.js',
  //   '3rd/handlebars/handlebars-v4.0.11.js',
  //   '3rd/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
  //   '3rd/bootstrap-datetimepicker/js/zh-cn.js',
  //   '3rd/daterangepicker/daterangepicker.js',
  //   '3rd/perfect-scrollbar/js/perfect-scrollbar.min.js',
  //   '3rd/select2/dist/js/select2.full.js',
  //   '3rd/pureScriptSelect/script.js',
  //   '3rd/viewerjs/viewer.js',
  //   '3rd/resizesensor/ElementQueries.js',
  //   '3rd/resizesensor/ResizeSensor.js',
  //   '3rd/showdown/showdown.min.js',
  //   '3rd/gridstack/gridstack-h5.js',
  //   '3rd/tagify/tagify.min.js',
  //   '3rd/resizesensor/ElementQueries.js',
  //   '3rd/resizesensor/ResizeSensor.js',
  //   '3rd/popper/popper.min.js',
  //   '3rd/tippy/tippy.min.js',
  //   '3rd/codemirror/codemirror.js',
  //   '3rd/codemirror/mode/javascript/javascript.js',
  //   '3rd/codemirror/mode/groovy/groovy.js',
  //   '3rd/codemirror/mode/xml/xml.js',
  //   '3rd/codemirror/mode/sql/sql.js',
  //   '3rd/vue/sde/sdeEditor/sde.config.js?t=88',
  //   '3rd/vue/sde/sdeEditor/ueditor/ueditor.all.min.js',
  //   '3rd/vue/sde/sdeEditor/ueditor/lang/zh-cn/zh-cn.js',
  //   '3rd/vue/sde/sdeEditor/js/sde-ie8-design.js',
  //   '3rd/katex/katex.min.js',
  //   '3rd/highlight/highlight.min.js',
  //   '3rd/quill/quill.min.js',
  //   '3rd/x-spreadsheet/xspreadsheet.js',
  //   '3rd/x-spreadsheet/zh-cn.js',
  // ])
  // // .pipe(babel({presets: ['es2015']}))
  //   .pipe(concat('./kui-3rd.min.js'))
  //   .pipe(uglify())
  //   .pipe(gulp.dest('./dist/'));

  // desktop js
  gulp.src(['src/js/*.js', 'src/js/application/*.js', 'src/js/container/*.js', 'src/js/control/*.js',
    'src/js/editor/*.js', 'src/js/widget/*.js'])
    // .pipe(babel({presets: ['es2015']}))
    .pipe(concat('./kui-all.min.js'))
    .pipe(uglify({}))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/*.js', 'src/js/application/*.js', 'src/js/container/*.js', 'src/js/control/*.js',
    'src/js/editor/*.js', 'src/js/widget/*.js'])
    .pipe(concat('./kui-all.js'))
    .pipe(gulp.dest('./dist/'));

  // tablet js
  gulp.src(['src/js/kui-xhr.js', 'src/js/kui-ajax.js', 'src/js/kui-dialog.js', 'src/js/kui-dom.js',
    'src/js/kui-validation.js', 'src/js/kui-formdata.js', 'src/js/kui-utils.js',
    'src/js/editor/DataSheet.js', 'src/js/container/Tabs.js', 'src/js/container/PaginationGrid.js',
    'src/js/container/Timeline.js', 'src/js/container/ListView.js', 'src/js/container/Wizard.js',
    'src/js/application/Chat.js',
    'src/js/kuit.js'])
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
    'src/js/kuim.js', 'src/js/flutter.js'])
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
    'src/js/kuim.js', 'src/js/flutter.js'])
    .pipe(concat('./kui-all.mobile.js'))
    .pipe(gulp.dest('./dist/'));

  // desktop css
  // gulp.src([
  //   '3rd/font-awesome/css/all.min.css',
  //   '3rd/font-awesome/css/v4-shims.css',
  //   '3rd/material-icons/material-icons.css',
  //   '3rd/devicon/devicon.min.css',
  //   '3rd/simple-line-icons/css/simple-line-icons.css',
  //   '3rd/animation/animate.min.css',
  //   '3rd/bootstrap-datetimepicker/css/bootstrap-datetimepicker.css',
  //   '3rd/bootstrap-datetimepicker/css/bootstrap-datetimepicker-standalone.css',
  //   '3rd/bootstrap-fileinput/css/fileinput.min.css',
  //   '3rd/bootstrap-lightbox/ekko-lightbox.css',
  //   '3rd/perfect-scrollbar/css/perfect-scrollbar.css',
  //   '3rd/pureScriptSelect/style.css',
  //   '3rd/viewerjs/viewer.css',
  //   '3rd/codemirror/codemirror.css',
  //   '3rd/tagify/tagify.css',
  //   '3rd/ztree/css/zTreeStyle/zTreeStyle.css',
  //   '3rd/select2/dist/css/select2.css',
  //   '3rd/daterangepicker/daterangepicker.css',
  //   '3rd/x-spreadsheet/xspreadsheet.css',
  //   '3rd/vue/index.css',
  //   '3rd/quill/quill.snow.css',
  // ])
  //   .pipe(concat('./kui-3rd.min.css'))
  //   .pipe(uglifycss())
  //   .pipe(gulp.dest('./dist/'));

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