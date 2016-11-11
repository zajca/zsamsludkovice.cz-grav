var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream2');
var gutil = require('gulp-util');
var csso = require('gulp-csso');
var gif = require('gulp-if');
var del = require('del');
var concat = require('gulp-concat');
var sourceMap = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

/*POST CSS*/
var removePrefixes = require('postcss-remove-prefixes');
var autoprefixer = require('autoprefixer');
var assets = require('postcss-assets');
var postcssSvgo = require('postcss-svgo');
var postcss = require('gulp-postcss');

//LOAD CONFIG
var pkg = require('./package.json');
var config = pkg['config'];
var dirs = pkg['config'].directories;


gulp.task('styles', function(){

    var processors = [
        removePrefixes,
        autoprefixer({browsers: config.browsers}),
        assets({
            relativeTo: 'assets/css',
            cachebuster: true
        }),
        postcssSvgo()
    ];

    return gulp.src(dirs.src + 'sass/main.scss')
        .pipe(plumber())
        .pipe(gif(
            process.env.NODE_ENV != 'prod',
            sourceMap.init()
        ))
        .pipe(sass({
          includePaths: [
            path.join(__dirname, 'node_modules'),
            path.join(__dirname, 'bower_components'),
            path.join(__dirname, 'bower_components/foundation/scss')
          ]
        }).on('error',gutil.log))
        .pipe(postcss(processors))
        .pipe(gif(
            process.env.NODE_ENV == 'prod',
            gif('*.css',csso())
        ))
        .pipe(gif(
            process.env.NODE_ENV != 'prod',
            sourceMap.write()
        ))
        .pipe(gulp.dest(dirs.dist + 'css'))
        .pipe(gif(
            process.env.NODE_ENV != 'prod',
            livereload()
        ));
});

gulp.task('vendor_scripts', function() {
    return gulp.src(config.vendorJS)
    .pipe(concat('vendor.js'))
    .pipe(gif(
        process.env.NODE_ENV == 'prod',
        uglify()
    ))
    .pipe(gulp.dest(dirs.dist + 'js'));
});

gulp.task('scripts', function(){
    browserify({
        entries: dirs.src + 'js/main.js',
        debug: process.env.NODE_ENV != 'prod'
    })
        .transform(babelify)
        .bundle().on('error', function (err) {
            console.log(err.toString());
            this.emit("end");
        })
        .pipe(source('main.bundle.js'))
        .pipe(gif(
            process.env.NODE_ENV == 'prod',
            uglify()
        ))
        .pipe(gulp.dest(dirs.dist + 'js'))
        .pipe(gif(
            process.env.NODE_ENV != 'prod',
            livereload()
        ));
});

gulp.task('watch', function(){
    livereload.listen();
    gulp.watch(dirs.src + '/sass/**/*.scss', ['styles']);
    gulp.watch(dirs.src + '/js/**/*.js', ['scripts']);
    gulp.watch(dirs.src + '/images/*', ['images']);
});

gulp.task('clean',function(){
    del.sync([dirs.dist+'js',dirs.dist+'css']);
});

gulp.task('dev',['clean'], function(callback){
    runSequence(['styles', 'scripts', 'vendor_scripts'], 'watch', callback)
});

gulp.task('build',['clean'], function(callback){
    runSequence(['styles', 'scripts', 'vendor_scripts'], callback)
});
