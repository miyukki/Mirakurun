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
const api = require("../../../api");
const Tuner_1 = require("../../../Tuner");
exports.parameters = [
    {
        in: "path",
        name: "index",
        type: "integer",
        minimum: 0,
        required: true
    }
];
exports.get = (req, res) => {
    let tuner = Tuner_1.default.get(req.params.index);
    if (tuner === null || Number.isInteger(tuner.pid) === false) {
        api.responseError(res, 404);
        return;
    }
    api.responseJSON(res, { pid: tuner.pid });
};
exports.get.apiDoc = {
    tags: ["tuners"],
    operationId: "getTunerProcess",
    responses: {
        200: {
            description: "OK",
            schema: {
                $ref: "#/definitions/TunerProcess"
            }
        },
        404: {
            description: "Not Found",
            schema: {
                $ref: "#/definitions/Error"
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
exports.del = (req, res) => {
    const tuner = Tuner_1.default.get(req.params.index);
    if (tuner === null || Number.isInteger(tuner.pid) === false) {
        api.responseError(res, 404);
        return;
    }
    tuner.kill()
        .then(() => api.responseJSON(res, { pid: null }))
        .catch((error) => api.responseError(res, 500, error.message));
};
exports.del.apiDoc = {
    tags: ["tuners"],
    operationId: "killTunerProcess",
    responses: {
        200: {
            description: "OK",
            schema: {
                type: "object",
                properties: {
                    pid: {
                        type: "null"
                    }
                }
            }
        },
        404: {
            description: "Not Found",
            schema: {
                $ref: "#/definitions/Error"
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

//# sourceMappingURL=process.js.map
