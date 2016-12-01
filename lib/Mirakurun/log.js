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
/// <reference path="../../typings/index.d.ts" />
"use strict";
const util = require("util");
(function (LogLevel) {
    LogLevel[LogLevel["FATAL"] = -1] = "FATAL";
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(exports.LogLevel || (exports.LogLevel = {}));
var LogLevel = exports.LogLevel;
exports.logLevel = LogLevel.INFO;
let offsetStr;
let offsetMS = 0;
if (/ GMT\+\d{4} /.test(new Date().toString()) === true) {
    const date = new Date();
    offsetStr = date.toString().match(/ GMT(\+\d{4}) /)[1];
    offsetStr = offsetStr.slice(0, 3) + ":" + offsetStr.slice(3, 5);
    offsetMS = date.getTimezoneOffset() * 60 * 1000;
}
function getLogString(lvstr, msgs) {
    let isoStr;
    if (offsetStr) {
        isoStr = new Date(Date.now() - offsetMS).toISOString();
        isoStr = isoStr.slice(0, -1) + offsetStr;
    }
    else {
        isoStr = new Date().toISOString();
    }
    return isoStr + " " + lvstr + ": " + util.format.apply(null, msgs);
}
function debug() {
    if (exports.logLevel >= LogLevel.DEBUG) {
        console.log(getLogString.call(this, "debug", arguments));
    }
}
exports.debug = debug;
function info() {
    if (exports.logLevel >= LogLevel.INFO) {
        console.info(getLogString.call(this, "info", arguments));
    }
}
exports.info = info;
function warn() {
    if (exports.logLevel >= LogLevel.WARN) {
        console.warn(getLogString.call(this, "warn", arguments));
    }
}
exports.warn = warn;
function error() {
    if (exports.logLevel >= LogLevel.ERROR) {
        console.error(getLogString.call(this, "error", arguments));
    }
}
exports.error = error;
function fatal() {
    if (exports.logLevel >= LogLevel.FATAL) {
        console.error(getLogString.call(this, "fatal", arguments));
    }
}
exports.fatal = fatal;

//# sourceMappingURL=log.js.map
