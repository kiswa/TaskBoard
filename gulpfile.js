'use strict';

let gulp = require('gulp'),
    fs = require('fs'),
    del = require('del'),
    touch = require('touch'),
    merge = require('merge-stream'),
    SystemBuilder = require('systemjs-builder'),

    mocha = require('gulp-mocha'),
    coverage = require('gulp-coverage'),
    phpunit = require('gulp-phpunit'),

    concat = require('gulp-concat'),
    imageMin = require('gulp-imagemin'),
    composer = require('gulp-composer'),

    tsc = require('gulp-typescript'),
    jsMinify = require('gulp-uglify'),

    scssLint = require('gulp-scss-lint'),
    sass = require('gulp-sass'),
    cssImport = require('gulp-cssimport'),
    cssPrefixer = require('gulp-autoprefixer'),
    cssMinify = require('gulp-cssnano'),

    paths = {
        bourbon: 'node_modules/bourbon/app/assets/stylesheets',
        neat: 'node_modules/bourbon-neat/app/assets/stylesheets',
        scss_base: 'node_modules/scss-base/src',
        chartist: 'node_modules/chartist/dist/scss',

        tests_app: 'test/app/**/*.spec.js',
        tests_api: 'test/api/**/*.php',

        ts: 'src/app/**/*.ts',
        html: [
            'src/**/*.html',
            'src/.htaccess'
        ],
        images: 'src/images/**/*.*',
        scss: 'src/scss/**/*.scss',
        scssMain: 'src/scss/main.scss',
        api: [
            'src/api/**/*.*',
            'src/api/.htaccess',
            '!src/api/composer.*'
        ]
    };

gulp.task('clean', () => {
    return del('dist');
});

gulp.task('html', () => {
    return gulp.src(paths.html)
        .pipe(gulp.dest('dist/'));
});

gulp.task('fonts', () => {
    return gulp.src('src/fonts/fontello.*')
        .pipe(gulp.dest('dist/css/fonts/'));
});

gulp.task('images', () => {
    return gulp.src(paths.images)
        .pipe(imageMin())
        .pipe(gulp.dest('dist/images/'));
});

gulp.task('scss-lint', () => {
    return gulp.src(paths.scss)
        .pipe(scssLint({ config: 'lint.yml' }));
});

gulp.task('scss', () => {
    return gulp.src(paths.scssMain)
        .pipe(sass({
            precision: 10,
            includePaths: [
                paths.bourbon,
                paths.neat,
                paths.scss_base,
                paths.chartist
            ]
        }))
        .pipe(concat('styles.css'))
        .pipe(cssImport({}))
        .pipe(cssPrefixer())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('tsc', () => {
    del('build/');

    let tsProject = tsc.createProject('tsconfig.json'),
        tsResult = tsProject.src()
            .pipe(tsc(tsProject));

    return tsResult.js
        .pipe(gulp.dest('build/'));
});

gulp.task('sourceMaps', () => {
    return gulp.src([
            'node_modules/reflect-metadata/Reflect.js.map'
        ])
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('vendor', ['sourceMaps'], () => {
    return gulp.src([
            'node_modules/core-js/client/shim.js',
            'node_modules/zone.js/dist/zone.js',
            'node_modules/reflect-metadata/Reflect.js',
            'node_modules/chartist/dist/chartist.js',
            'node_modules/chartist-plugin-tooltip/dist/chartist-plugin-tooltip.js'
        ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('system-build', ['tsc'], () => {
    var builder = new SystemBuilder();

    return builder.loadConfig('system.config.js')
        .then(() => builder.buildStatic('app', 'dist/js/bundle.js'))
        .then(() => del('build'));
});

gulp.task('minify', () => {
    // jsMinify options object is temporary due to problem in Angular RC5
    let js = gulp.src('dist/js/**/*.js')
        .pipe(jsMinify({
            mangle: { screw_ie8 : true, keep_fnames: true }
        }))
        .pipe(gulp.dest('dist/js/'));

    let css = gulp.src('dist/css/styles.css')
        .pipe(cssMinify())
        .pipe(gulp.dest('dist/css/'));

    return merge(js, css);
});

gulp.task('composer', () => {
    return composer({
        'working-dir': 'src/api'
    });
});

gulp.task('api', () => {
    return gulp.src(paths.api)
        .pipe(gulp.dest('dist/api/'));
});

gulp.task('test', ['test-app', 'test-api']);

gulp.task('test-app', ['tsc'], () => {
    return gulp.src(paths.tests_app)
        .pipe(mocha({
            require: ['./test/app/mocks.js']
        }));
});

gulp.task('coverage', ['tsc'], () => {
    return gulp.src(paths.tests_app)
        .pipe(coverage.instrument({
            pattern: ['build/**/*.js']
        }))
        .pipe(mocha({
            require: ['./test/app/mocks.js']
        }))
        .pipe(coverage.gather())
        .pipe(coverage.format())
        .pipe(gulp.dest('./'));
});

gulp.task('api-test-db', () => {
    del('tests.db');
    touch('tests.db');
    fs.chmod('tests.db', '0666');
});

gulp.task('test-api', ['api-test-db'], () => {
    del('tests.log');

    return gulp.src('test/api/phpunit.xml')
        .pipe(phpunit('./src/api/vendor/phpunit/phpunit/phpunit'));
});

gulp.task('test-api-single', ['api-test-db'], () => {
    del('tests.log');

    return gulp.src('test/api/phpunit.xml')
        .pipe(phpunit('./src/api/vendor/phpunit/phpunit/phpunit',
            { group: 'single' }));
});

gulp.task('watch', () => {
    let watchTs = gulp.watch(paths.ts, ['system-build']),
        watchScss = gulp.watch(paths.scss, ['scss-lint', 'scss']),
        watchHtml = gulp.watch(paths.html, ['html']),
        watchImages = gulp.watch(paths.images, ['images']),
        watchApi = gulp.watch(paths.api, ['api']),

        onChanged = (event) => {
            console.log('File ' + event.path + ' was ' + event.type +
            '. Running tasks...');
        };

    watchTs.on('change', onChanged);
    watchScss.on('change', onChanged);
    watchHtml.on('change', onChanged);
    watchImages.on('change', onChanged);
    watchApi.on('change', onChanged);
});

gulp.task('watchtests', () => {
    let watchTests = gulp.watch(paths.tests_app, ['test-app']),
        watchTs = gulp.watch(paths.ts, ['test-app']),

        onChanged = (event) => {
            console.log('File ' + event.path + ' was ' + event.type +
                '. Running tasks...');
        };

    watchTests.on('change', onChanged);
    watchTs.on('change', onChanged);
});

gulp.task('default', [
    'vendor',
    'system-build',
    'html',
    'images',
    'scss-lint',
    'fonts',
    'scss',
    'api'
], () => {
    fs.chmod('dist/api', '0777');
});

