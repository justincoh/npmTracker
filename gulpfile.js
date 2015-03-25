var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

// var paths = {
// 	myScripts: '/public/javascripts/*.js'
// };
var concatted = 'concat.js'

gulp.task('scripts',function(){
	return gulp.src('public/javascripts/*.js')
		.pipe(concat(concatted))
		.pipe(gulp.dest('public/javascripts'))
		// .pipe(rename("fullApp.min.js"))
		// .pipe(uglify())
		// .pipe(gulp.dest('public/javascripts'))
});

gulp.task('vanillaClean',function(){
	del('public/javascripts/'+concatted,function(err,deletedFiles){
		console.log('Deleted: ',deletedFiles.join(', ');)
	});
})