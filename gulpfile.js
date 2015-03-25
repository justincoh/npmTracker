var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

var myScripts ='public/javascripts/';

var files = {
	concat:'concat.js',
	min: 'full.min.js'
};

gulp.task('clean',function(){
	del([myScripts+files.concat,myScripts+files.min],function(err,deletedFiles){
		console.log('Deleted: ',deletedFiles.join(', '));
		return;
	});
});

gulp.task('build',['clean'],function(){
	//This is having an async error when the files already exist
	//see how gulp actually handles the dependencies
	return gulp.src(myScripts+'*.js')
		.pipe(concat(files.concat))
		.pipe(gulp.dest(myScripts))
		.pipe(rename(files.min))
		.pipe(uglify({mangle:false}))
		.pipe(gulp.dest(myScripts))
});

