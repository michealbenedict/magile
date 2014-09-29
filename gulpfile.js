// Gulp
// ====
var gulp        = require('gulp');
var gutil       = require('gulp-util');

// Other includes
// ==============
var rimraf      = require("rimraf");
var path        = require('path');
var fs          = require('fs');

// Gulp plugins
// ============
var concat      = require('gulp-concat');
var jade        = require('gulp-jade');
var sass        = require('gulp-ruby-sass');
var bower       = require('main-bower-files');
var livereload  = require('gulp-livereload');
var through     = require('through2');
var rename      = require('gulp-rename');

// CONSTANTS
// =========
const PUBLIC_DIR        = "./";
const PUBLIC_SITE_DIR   = path.join(PUBLIC_DIR);
const PUBLIC_JS_DIR     = path.join(PUBLIC_DIR, 'assets'. 'js');
const PUBLIC_CSS_DIR    = path.join(PUBLIC_DIR, 'assets'. 'css');
const PUBLIC_VENDOR_DIR = path.join(PUBLIC_DIR, 'assets'. 'vendor');

const APP_DIR       = "./src";
const APP_VIEWS_DIR = "./src";
const APP_SASS_DIR  = "./src/sass";
const APP_JS_DIR    = "./src/js";

const POST_DIR = "./posts";

var locals = {
  CSS_PATH: PUBLIC_CSS_DIR,
  JS_PATH: PUBLIC_JS_DIR,
  VENDOR_PATH: PUBLIC_VENDOR_DIR,
  SITE_PATH: '/'
};

// CLEAN TASKS
// ===========
/*
 * @task clean 
 * @description Remove all the files from the public directory
**/
gulp.task('clean', function () {
  rimraf.sync(PUBLIC_DIR);
});

/*
 * @task clean:css
 * @description Remove css from the public directory
**/
gulp.task('clean:css', function () {
  rimraf.sync(PUBLIC_CSS_DIR);
});

/*
 * @task clean:vendor
 * @description Remove vendor from the public directory
**/
gulp.task('clean:vendor', function () {
  rimraf.sync(PUBLIC_VENDOR_DIR);
});

/*
 * @task clean:js
 * @description Remove js from the public directory
**/
gulp.task('clean:js', function () {
  rimraf.sync(PUBLIC_JS_DIR);
});

// BUILD TASKS
// ===========
/*
 * @task build:bower
 * @description All bower files are stored in Vendor. 
 *              Remve the vendor folder and install from bower
**/
gulp.task('build:vendor', ['clean:vendor'], function () {
  return gulp.src(bower(), { base: './bower_components' })
    .pipe(gulp.dest(PUBLIC_VENDOR_DIR))
});

/*
 * @task build:sass
 * @description Run the sass preprocessor and concat to a single stylessheet
**/
gulp.task('build:sass', ['clean:css'], function () {
  gulp.src(APP_SASS_DIR + '/global.scss')
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(PUBLIC_CSS_DIR))
});

/*
 * @task build:js
 * @description concats js files
**/
gulp.task('build:js', ['clean:js'], function () {
  gulp.src(APP_JS_DIR + '/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest(PUBLIC_JS_DIR))
});

/*
 * @task build:templates
 * Generate other pages of the site
**/
gulp.task('build:templates', function () {
  gulp.src([APP_VIEWS_DIR + '/*.jade'])
    .pipe(jade())
    .pipe(rename(function (path) {
      path.extname = '.hbs';
    }))
    .pipe(gulp.dest(PUBLIC_SITE_DIR))
});


/*
 * @task build:site
 * Generate the site
**/
gulp.task('build:site',  ['build:vendor', 'build:sass', 'build:js']);


// OTHER TASKS
// ===========
/*
 * @task watch
 * @depends [sass, serve]
 * @description Runs a live-reload server. 
 *              Listens on public foler
 *              Listens on templates folder
**/
gulp.task('watch', ['build:site', 'serve'], function() {
  var server = livereload();

  gulp.watch([APP_DIR + '/**/*', PUBLIC_DIR + '/**/*', POST_DIR + '/**/*'])
    .on('change', function (file) {
      var filePath = './' + path.relative(__dirname, file.path);

      if ( filePath.indexOf(APP_VIEWS_DIR) === 0 || filePath.indexOf(POST_DIR) === 0 ) {
        gulp.run('build:templates');
        gulp.run('build:index');
        gulp.run('build:posts');
      } else if ( filePath.indexOf(APP_SASS_DIR) === 0 ) {
        gulp.run('build:sass');
      } else {
        server.changed(file.path);
      }
    });
});

/*
 * @task serve
 * Runs a static server on port 3000
**/
gulp.task('serve', function () {
  const PORT = 3000;
  var fileServer = new (require('node-static')).Server(PUBLIC_DIR);

  require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      fileServer.serve(request, response);
    }).resume();
  }).listen(PORT);

  gutil.log(gutil.colors.blue('HTTP server listening on port', PORT));
});