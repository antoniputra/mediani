var pkg = require('./package.json')
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	fs = require('vinyl-fs'),
	header = require('gulp-header'),
	plumber = require('gulp-plumber'),
	rename  = require('gulp-rename'),
    clean   = require('gulp-clean');

var paths = {
	output : 'dist/',
	scripts : [
		'src/mediani.js'
	]
};

var banner = [
	'/*! \n',
	'<%= package.name %> ',
	'v<%= package.version %> \n',
	'(c) ' + new Date().getFullYear() + ' <%= package.author %>',
	' <%= package.homepage %>',
	'\n */',
	'\n \n'
].join('');

gulp.task('clean', function () {
	return gulp.src(paths.output, { read: false })
		.pipe(plumber())
		.pipe(clean());
});


gulp.task('scripts', ['clean'], function() {
	return gulp.src(paths.scripts)
		.pipe(plumber())
		.pipe(header(banner, { package : pkg }))
		.pipe(gulp.dest('dist/'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(header(banner, { package : pkg }))
		.pipe(gulp.dest('dist/'));
});


gulp.task('watch', function() {
	gulp.watch('src/*.js', ['scripts']);
});


gulp.task('default', ['scripts']);