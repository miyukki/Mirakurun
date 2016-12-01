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
const fs = require("fs");
const yaml = require("js-yaml");
const log = require("./log");
function loadServer() {
    return load(process.env.SERVER_CONFIG_PATH);
}
exports.loadServer = loadServer;
function saveServer(data) {
    return save(process.env.SERVER_CONFIG_PATH, data);
}
exports.saveServer = saveServer;
function loadTuners() {
    return load(process.env.TUNERS_CONFIG_PATH);
}
exports.loadTuners = loadTuners;
function saveTuners(data) {
    return save(process.env.TUNERS_CONFIG_PATH, data);
}
exports.saveTuners = saveTuners;
function loadChannels() {
    return load(process.env.CHANNELS_CONFIG_PATH);
}
exports.loadChannels = loadChannels;
function saveChannels(data) {
    return save(process.env.CHANNELS_CONFIG_PATH, data);
}
exports.saveChannels = saveChannels;
function load(path) {
    log.debug("load config `%s`", path);
    return yaml.safeLoad(fs.readFileSync(path, "utf8"));
}
function save(path, data) {
    log.debug("save config `%s`", path);
    return new Promise((resolve, reject) => {
        fs.writeFile(path, yaml.safeDump(data), err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

//# sourceMappingURL=config.js.map
