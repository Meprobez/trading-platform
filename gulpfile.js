var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    flatten = require('gulp-flatten'),
    sourcemaps = require('gulp-sourcemaps'),
    destFileOptions = {mode: "755"};


gulp.task('icons', function() { 
  return gulp.src('bower_components/bootstrap/fonts/**.*') 
    .pipe(gulp.dest('app/final/fonts')); 
});

gulp.task('styles',['icons'], function() {
  return gulp.src(['bower_components\\bootstrap\\dist\\css\\bootstrap.css','app/styles/*.css'])
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(concat('main.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/final/css',{overwrite: true}))
});

gulp.task('buildNg',function(){
  return gulp.src(['bower_components/angular/angular.min.js',
                   'bower_components/angular-animate/angular-animate.min.js',
                   'bower_components/angular-ui-router/release/angular-ui-router.min.js'])
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('allNg.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(flatten())
        .pipe(gulp.dest('app/build',{overwrite: true, mode: "755"}))
})

gulp.task('buildCustomScripts',function(){
  return gulp.src(['app/scripts/app.js',
                   'app/scripts/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(flatten())
    .pipe(gulp.dest('app/build',{overwrite: true, mode: "755"}))
})

gulp.task('buildAllJs',['buildNg','buildCustomScripts'],function(){
  return gulp.src(['app/build/allNg.min.js',
                   'app/build/scripts.min.js'])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/final/js',{overwrite: true, mode:"755"}))
})

gulp.task('watch', function() {
  gulp.watch('app/styles/*.css', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['buildAllJs']);
});
gulp.task('default',['buildAllJs','styles']);
