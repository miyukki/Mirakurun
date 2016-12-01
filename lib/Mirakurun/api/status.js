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
"use strict";
const status_1 = require("../status");
const Program_1 = require("../Program");
const Tuner_1 = require("../Tuner");
exports.get = (req, res) => {
    const ret = {
        process: {
            arch: process.arch,
            platform: process.platform,
            versions: process.versions,
            pid: process.pid,
            memoryUsage: process.memoryUsage()
        },
        epg: {
            gatheringNetworks: [],
            storedEvents: Program_1.default.all().length
        },
        streamCount: {
            tunerDevice: Tuner_1.default.all().filter(td => td.isUsing === true).length,
            tsFilter: status_1.default.streamCount.tsFilter,
            decoder: status_1.default.streamCount.decoder
        },
        errorCount: status_1.default.errorCount,
        timerAccuracy: {
            // ns → μs
            last: status_1.default.timerAccuracy.last / 1000,
            m1: {
                avg: (status_1.default.timerAccuracy.m1.reduce((a, b) => a + b) / status_1.default.timerAccuracy.m1.length) / 1000,
                min: Math.min.apply(null, status_1.default.timerAccuracy.m1) / 1000,
                max: Math.max.apply(null, status_1.default.timerAccuracy.m1) / 1000
            },
            m5: {
                avg: (status_1.default.timerAccuracy.m5.reduce((a, b) => a + b) / status_1.default.timerAccuracy.m5.length) / 1000,
                min: Math.min.apply(null, status_1.default.timerAccuracy.m5) / 1000,
                max: Math.max.apply(null, status_1.default.timerAccuracy.m5) / 1000
            },
            m15: {
                avg: (status_1.default.timerAccuracy.m15.reduce((a, b) => a + b) / status_1.default.timerAccuracy.m15.length) / 1000,
                min: Math.min.apply(null, status_1.default.timerAccuracy.m15) / 1000,
                max: Math.max.apply(null, status_1.default.timerAccuracy.m15) / 1000
            }
        }
    };
    for (let nid in status_1.default.epg) {
        if (status_1.default.epg[nid] === true) {
            ret.epg.gatheringNetworks.push(parseInt(nid, 10));
        }
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200);
    res.end(JSON.stringify(ret, null, 2));
};
exports.get.apiDoc = {
    tags: ["status"],
    operationId: "getStatus",
    responses: {
        200: {
            description: "OK",
            schema: {
                $ref: "#/definitions/Status"
            }
        },
        default: {
            description: "Unexpected Error",
            schema: {
                $ref: "#/definitions/Error"
            }
        }
    }
};

//# sourceMappingURL=status.js.map
