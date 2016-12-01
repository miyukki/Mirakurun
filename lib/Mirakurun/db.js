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
const log = require("./log");
var db;
(function (db) {
    (function (ProgramAudioSamplingRate) {
        ProgramAudioSamplingRate[ProgramAudioSamplingRate["16kHz"] = 16000] = "16kHz";
        ProgramAudioSamplingRate[ProgramAudioSamplingRate["22.05kHz"] = 22050] = "22.05kHz";
        ProgramAudioSamplingRate[ProgramAudioSamplingRate["24kHz"] = 24000] = "24kHz";
        ProgramAudioSamplingRate[ProgramAudioSamplingRate["32kHz"] = 32000] = "32kHz";
        ProgramAudioSamplingRate[ProgramAudioSamplingRate["44.1kHz"] = 44100] = "44.1kHz";
        ProgramAudioSamplingRate[ProgramAudioSamplingRate["48kHz"] = 48000] = "48kHz";
    })(db.ProgramAudioSamplingRate || (db.ProgramAudioSamplingRate = {}));
    var ProgramAudioSamplingRate = db.ProgramAudioSamplingRate;
    function loadServices() {
        return load(process.env.SERVICES_DB_PATH);
    }
    db.loadServices = loadServices;
    function saveServices(data) {
        return save(process.env.SERVICES_DB_PATH, data);
    }
    db.saveServices = saveServices;
    function loadPrograms() {
        return load(process.env.PROGRAMS_DB_PATH);
    }
    db.loadPrograms = loadPrograms;
    function savePrograms(data) {
        return save(process.env.PROGRAMS_DB_PATH, data);
    }
    db.savePrograms = savePrograms;
    function load(path) {
        log.debug("load db `%s`", path);
        if (fs.existsSync(path) === true) {
            return require(path);
        }
        else {
            return [];
        }
    }
    function save(path, data) {
        log.debug("save db `%s`", path);
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(data), err => {
                if (err) {
                    return reject(err);
                }
                delete require.cache[require.resolve(path)];
                resolve();
            });
        });
    }
})(db || (db = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = db;

//# sourceMappingURL=db.js.map
