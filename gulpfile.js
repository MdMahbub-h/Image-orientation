const {src, dest, watch, parallel, series} = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
// const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');

function mainScripts() {
    return src('/js/**/*.js')
    // .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(babel({
        presets: [
            // '@babel/env'
            ['@babel/preset-env', { "modules": false }]
        ],
        // "comments": false,
        // "compact": true
    }))
    .pipe(uglify({
        compress: {
            drop_console: true
        }
    }))
    // .pipe(sourcemaps.write('.'))
    .pipe(dest('/js_min/'));
}

function bootScript() {
    return src('/boot.js')
    // .pipe(babel({
    //     presets: [
    //         // '@babel/env'
    //         ['@babel/preset-env', { "modules": false }]
    //     ],
    //     "comments": false,
    //     "compact": true
    // }))
    .pipe(uglify())
    .pipe(dest('/js_min/'));
}

function configScript() {
    return src('/config.js')
    // .pipe(babel({
    //     presets: [
    //         // '@babel/env'
    //         ['@babel/preset-env', { "modules": false }]
    //     ],
    //     "comments": false,
    //     "compact": true
    // }))
    .pipe(uglify())
    .pipe(dest('/js_min/'));
}

function requestScript() {
    return src('/game_request.js')
    // .pipe(babel({
    //     presets: [
    //         // '@babel/env'
    //         ['@babel/preset-env', { "modules": false }]
    //     ],
    //     "comments": false,
    //     "compact": true
    // }))
    .pipe(uglify())
    .pipe(dest('/js_min/'));
}

function testScript() {
    return src('/test.js')
    .pipe(babel({
        presets: [
            // '@babel/env'
            ['@babel/preset-env', { "modules": false }]
        ],
        "comments": false,
        "compact": false
    }))
    // .pipe(uglify())
    .pipe(dest('/js_min/'));
}

function cleanDist() {
    return src('./js_min/')
    .pipe(clean())
}

exports.mainScripts = mainScripts;
exports.bootScript = bootScript;
exports.requestScript = requestScript;
exports.configScript = configScript;
exports.testScript = testScript;

exports.default = parallel(mainScripts, bootScript, requestScript, configScript);