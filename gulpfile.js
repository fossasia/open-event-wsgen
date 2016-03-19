var gulp = require('gulp'),
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    inject = require('gulp-inject'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    flatten = require('gulp-flatten');

var bases = {
    dev: {
        root: './',
        app: './app',
        libs: './app/libs',
        assets: './assets',
        testapi: './testapi'
    },
    dist: {
        root: 'dist/',
        app: 'dist/app/',
        libs: 'dist/libs/',
        assets: 'dist/assets',
        testapi: 'dist/testapi'
    }
};

var srcPaths = {
    index: [
        './index.html',
        './app.js',
        './main.css',
        './config.js',
        './manifest.*'

    ],
    libs: [
        './bower_components/angular/angular.js',
        './bower_components/leaflet/leaflet.*',
        './bower_components/**/angular-simple-logger.js',
        './bower_components/**/angular-animate.js',
        './bower_components/**/angular-aria.js',
        './bower_components/**/angular-leaflet-directive.js',
        './bower_components/**/angular-material.js',
        './bower_components/**/angular-material.css',
        './bower_components/**/angular-ui-router.js',
        './bower_components/**/ngStorage.js',
    ],
    assets: ['./assets/**/*'],
    components: ['./app/**/*'],
    testapi: ['./testapi/**/*']
};

var distPaths = {
    css: [
    bases.dist.root + 'assets/**/*.css',
    bases.dist.root + 'libs/**/*.css',
    bases.dist.root + 'main.css'
    ],
    js: [
        bases.dist.root + 'assets/**/*.js',
        bases.dist.root + 'libs/angular.*js',
        bases.dist.root + 'libs/**/*.js',
        bases.dist.root + 'app.js',
        bases.dist.root + 'app/components/**/*.js'
    ]
};

function distCopy () {
    gulp.src(srcPaths.index)
        .pipe(gulp.dest(bases.dist.root));
    gulp.src(srcPaths.libs)
        .pipe(flatten())
        .pipe(gulp.dest(bases.dist.libs));
    gulp.src(srcPaths.assets)
        .pipe(gulp.dest(bases.dist.assets));
    gulp.src(srcPaths.components)
        .pipe(gulp.dest(bases.dist.app));
    gulp.src(srcPaths.testapi)
        .pipe(gulp.dest(bases.dist.testapi));

}

function injectImports ($envType) {
    if ($envType === 'dist') {
        var distIndex = gulp.src(bases.dist.root + 'index.html');

        var distIncludes =
            gulp.src(distPaths.css.concat(distPaths.js), {read:false});

        // Flush the inject blocks so the real include can work
        distIndex.pipe(inject(gulp.src('')))
            .pipe(gulp.dest(bases.dist.root));

        // Include really now
        distIndex.pipe(inject(distIncludes, {
            addRootSlash: false,
            ignorePath: bases.dist.root
        }))
            .pipe(gulp.dest(bases.dist.root));
    } else {
        var devIndex = gulp.src('./index.html');
        // It's not necessary to read the files (will speed up things),
        // we're only after their paths:
        var devIncludes = gulp.src(
            srcPaths.assets.concat(
                srcPaths.libs).concat(
                srcPaths.index).concat(
                srcPaths.components), {read: false});

        devIndex.pipe(inject(devIncludes, {
            addRootSlash: false,
            ignorePath: '/'
        })).pipe(gulp.dest('./'));
    }
}

function distMinify () {
    gulp.src(distPaths.css, {cwd: './**'})
        .pipe(minify({compatibility: 'ie8'}))
        .pipe(gulp.dest('./'));
    gulp.src(distPaths.js, {cwd: './**'})
        .pipe(uglify())
        .pipe(gulp.dest('./'));
}

gulp.task('webserver', function() {
    // injectImports('dev');
    distCopy();
    setTimeout(function(){ injectImports('dist'); }, 2000);

    setTimeout(function(){}, 5000);
    connect.server({
        livereload: true,
        root: './dist/'
    });
});

gulp.task('clean', function() {
    return gulp.src(bases.dist.root)
        .pipe(clean());
});

gulp.task('styles', function() {
    gulp.src('./assets/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/'))
});

gulp.task('dist', function() {
    distCopy();
    setTimeout(function(){ injectImports('dist'); }, 2000);
});

gulp.task('dist-min', function() {
    distCopy();
    setTimeout(function(){ injectImports('dist'); }, 2000);
    setTimeout(function(){ distMinify(); }, 2000);
});

gulp.task('default', ['webserver', 'styles']);
