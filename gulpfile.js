/*
   Copyright 2016 Yuki KAN

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
/// <reference path="./typings/index.d.ts" />
"use strict";

const fs = require("fs");
const gulp = require("gulp");
const mocha = require('gulp-mocha');
const tslint = require("gulp-tslint");
const typescript = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");

gulp.task("tslint", () => {
    return gulp
        .src([
            "src/**/*.ts"
        ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }));
});

gulp.task("clean", ["tslint"], () => {
    del.sync(["lib"]);
});

gulp.task("tsc", ["clean"], () => {
    return gulp
        .src([
            "src/**/*.ts"
        ])
        .pipe(sourcemaps.init())
        .pipe(typescript({
            typescript: require("typescript"),
            target: "ES6",
            module: "commonjs",
            moduleResolution: "node",
            removeComments: false,
            declarationFiles: false
        }))
        .js
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("lib"));
});

gulp.task("build", ["tsc"], () => {
    return gulp
        .src([
            "src/client.ts"
        ])
        .pipe(typescript({
            typescript: require("typescript"),
            target: "ES6",
            module: "commonjs",
            moduleResolution: "node",
            removeComments: false,
            declarationFiles: true
        }))
        .dts
        .pipe(gulp.dest("lib"));
});

gulp.task("test", test)

gulp.task("watch", () => {
    gulp.watch("src/**/*.ts", ["build"]);
    gulp.watch("test/**/*.js", ["test"]);
});

gulp.task("default", ["build"], test);

function test() {
    return gulp
        .src(["test/**/*.js"])
        .pipe(
            mocha({
                reporter: "spec",
                timeout: 3000,
                slow: 10
            })
        );
}