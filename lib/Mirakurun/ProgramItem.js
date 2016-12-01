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
const common = require("./common");
const log = require("./log");
const _1 = require("./_");
const Event_1 = require("./Event");
class ProgramItem {
    constructor(_data, firstAdd = false) {
        this._data = _data;
        if (_1.default.program.exists(_data.id) === true) {
            const item = _1.default.program.get(_data.id);
            item.update(_data);
            return item;
        }
        const removedIds = [];
        if (firstAdd === false) {
            _1.default.program.findConflicts(_data.networkId, _data.serviceId, _data.startAt, _data.startAt + _data.duration).forEach(item => {
                item.remove();
                log.debug("ProgramItem#%d (networkId=%d, eventId=%d) has removed for redefine to ProgramItem#%d (eventId=%d)", item.data.id, item.data.networkId, item.data.eventId, _data.id, _data.eventId);
                removedIds.push(item.data.id);
            });
        }
        _1.default.program.add(this);
        if (firstAdd === false) {
            Event_1.default.emit("program", "create", this._data);
            removedIds.forEach(id => Event_1.default.emit("program", "redefine", { from: id, to: _data.id }));
        }
    }
    get id() {
        return this._data.id;
    }
    get service() {
        return _1.default.service.get(this._data.networkId, this._data.serviceId);
    }
    get data() {
        return this._data;
    }
    update(data) {
        if (common.updateObject(this._data, data) === true) {
            _1.default.program.save();
            Event_1.default.emit("program", "update", this._data);
        }
    }
    getStream(user) {
        return _1.default.tuner.getProgramStream(this, user);
    }
    remove() {
        _1.default.program.remove(this);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramItem;

//# sourceMappingURL=ProgramItem.js.map
