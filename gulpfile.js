
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var gzip = require('gulp-gzip');
var webserver = require('gulp-webserver');

var styleFiles = [
		'node_modules/normalize.css/normalize.css',
        'less/main.less'
    ];
var jsLibFiles = [
		'node_modules/jquery/dist/jquery.js',
		'node_modules/angular/angular.js',
		'node_modules/angular-animate/angular-animate.js',
		'node_modules/angular-resource/angular-resource.js',
		'node_modules/angular-route/angular-route.js'
		// 'node_modules/firebase/lib/firebase-node.js',
		// 'node_modules/angularfire/dist/angularfire.js'
	];
var jsAppFiles = [
		'js/*.js'
	];
var directives = [
		'directives/*.html'
	];
var html = [
		'./*.html'
	];
var assets = [
		'./assets/*'
	]

gulp.task('styles', function() {
    gulp.src(styleFiles)
        .pipe(less())
        .pipe(concat('main.css'))
		// .pipe(gzip())
        .pipe(gulp.dest('build/css/'));
});

gulp.task('scripts.lib', function(){
	gulp.src(jsLibFiles)
		.pipe(concat('lib.js'))
		// .pipe(uglify())
		// .pipe(gzip())
		.pipe(gulp.dest('build/js/'))
		.on('error', gutil.log);
});

gulp.task('scripts.app', function(){
	gulp.src(jsAppFiles)
		.pipe(concat('app.js'))
		// .pipe(uglify())
		// .pipe(gzip())
		.pipe(gulp.dest('build/js/'))
		.on('error', gutil.log);
});

gulp.task('html.directive', function(){
	gulp.src(directives)
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('build/js/directives'));
});

gulp.task('html.app', function(){
	gulp.src(html)
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('build'));
});

gulp.task('assets', function(){
	gulp.src(assets)
		.pipe(gulp.dest('build/assets'));
});

gulp.task('server', function() {
  gulp.src('app')
    .pipe(webserver({
      directoryListing: true,
      open: true,
      host: '0.0.0.0',
      path: 'build/',
      fallback: 'index.html'
    }));
});


gulp.task('watch', function(){
    gulp.watch(['css/less/*.less'], ['styles']);
    gulp.watch(jsAppFiles, ['scripts.app']);
    gulp.watch(directives, ['html.directive']);
    gulp.watch(html, ['html.app']);
});

gulp.task('build', ['styles', 'scripts.lib', 'scripts.app', 'html.directive', 'html.app', 'assets']);

// gulp.task('default', ['build', 'watch', 'server']);
gulp.task('default', ['build', 'watch']);