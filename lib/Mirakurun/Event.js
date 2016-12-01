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
const events_1 = require("events");
const _1 = require("./_");
class Event extends events_1.EventEmitter {
    constructor() {
        super();
        this._log = [];
        _1.default.event = this;
        this.on("event", message => {
            this._log.unshift(message);
            // testing
            if (this._log.length > 100) {
                this._log.pop();
            }
        });
    }
    get log() {
        return this._log;
    }
    static get log() {
        return _1.default.event.log;
    }
    static on(listener) {
        _1.default.event.on("event", listener);
    }
    static once(listener) {
        _1.default.event.once("event", listener);
    }
    static removeListener(listener) {
        _1.default.event.removeListener("event", listener);
    }
    static emit(resource, type, data) {
        const message = {
            resource: resource,
            type: type,
            data: data,
            time: Date.now()
        };
        return _1.default.event.emit("event", message);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Event;

//# sourceMappingURL=Event.js.map
