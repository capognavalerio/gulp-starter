const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const webpack = require('webpack-stream');
const webpackUglifyJSPlugin = require('uglifyjs-webpack-plugin');
const browserSync = require('browser-sync').create();
const config = require('./config.json');

function handleErrors(error) {
  notify.onError({
    title:    config.notify.error,
    message:  "<%= error.message %>",
  })(error);
  this.emit('end');
}

var cssTask = function() {
  var task = gulp
    .src(path.resolve(__dirname, config.css.input))
    .pipe(plumber({
      errorHandler: handleErrors
    }))
    .pipe(sourcemaps.init())
    .pipe(sass(config.css.sass).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(config.css.autoprefixer))
    .pipe(gulp.dest(path.resolve(__dirname, config.css.output)))
    .pipe(notify({
      message: config.css.message.success,
      onLast: true
    }));

  return browserSync.active ? task.pipe(browserSync.stream()) : task;
};

var jsTask = function() {
  var webpackConfig = {
    entry: path.resolve(__dirname, config.js.input),
    devtool: "source-map",
    output: {
      path: path.resolve(__dirname, config.js.output),
      filename: config.js.webpack.filename
    },
    plugins: [
      new webpackUglifyJSPlugin({
        sourceMap: true
      })
    ],
    module: {
      loaders: [{
        loader: 'babel-loader',
        exclude: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'bower_components')
        ],
        include: [
          path.resolve(__dirname, config.js.input),
        ],
        query: {
          plugins: config.js.webpack.babel.plugins,
          presets: config.js.webpack.babel.presets
        }
      }]
    }
  };

  return gulp
    .src(path.resolve(__dirname, config.js.input))
    .pipe(plumber({
      errorHandler: handleErrors
    }))
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(path.resolve(__dirname, config.js.output)))
    .pipe(notify({
      message: config.js.message.success,
      onLast: true
    }));
};

var serveTask = function() {
  browserSync.init(config.serve.browserSync);
  gulp.watch(config.serve.css, ['css']);
  gulp.watch(config.serve.js, ['js-watch']);
  gulp.watch(config.serve.html).on('change', browserSync.reload);
};

gulp.task('css', cssTask);
gulp.task('js', jsTask);
gulp.task('serve', serveTask);
gulp.task('js-watch', ['js'], function(done) {
  if (browserSync.active) {
    browserSync.reload();
  }
  done();
});
