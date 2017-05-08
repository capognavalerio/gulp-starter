const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const image = require('gulp-image');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();
const config = require('./config.json');

function handleErrors(error) {
  notify.onError({
    title:    config.notify.error,
    message:  "<%= error.message %>",
  })(error);
  this.emit('end');
}

function execTaskAndReload(done) {
  if (browserSync.active) {
    browserSync.reload();
  }

  done();
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

var webpackTask = function() {
  var webpackConfig = {
    entry: path.resolve(__dirname, config.js.input),
    devtool: "source-map",
    watch: true,
    cache: true,
    output: {
      path: path.resolve(__dirname, config.js.output),
      filename: config.js.webpack.filename
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        comments: false
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendors.js',
        minChunks: function(module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
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
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(path.resolve(__dirname, config.js.output)));
};

var serveTask = function() {
  browserSync.init(config.serve.browserSync);

  gulp.start('webpack');

  gulp.watch(config.serve.css, ['css']);
  gulp.watch(config.serve.images, ['watch-images']);
  gulp.watch(config.serve.html).on('change', browserSync.reload);
  gulp.watch(config.serve.js).on('change', function() {
    browserSync.reload();

    return gulp
      .src(path.resolve(__dirname, config.serve.js))
      .pipe(notify({
        message: config.js.message.success,
        onLast: true
      }));
  });
};

var imagesTask = function() {
  return gulp
    .src(path.resolve(__dirname, config.images.input))
    .pipe(image(config.images.options))
    .pipe(gulp.dest(path.resolve(__dirname, config.images.output)));
};

gulp.task('css', cssTask);
gulp.task('webpack', webpackTask);
gulp.task('serve', serveTask);
gulp.task('images', imagesTask);
gulp.task('watch-images', ['images'], execTaskAndReload);
