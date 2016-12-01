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
const log = require("./log");
const _1 = require("./_");
const db_1 = require("./db");
const queue_1 = require("./queue");
const ProgramItem_1 = require("./ProgramItem");
const sift = require("sift");
class Program {
    constructor() {
        this._items = [];
        this._programGCInterval = _1.default.config.server.programGCInterval || 1000 * 60 * 15;
        _1.default.program = this;
        this._load();
        setTimeout(this._gc.bind(this), this._programGCInterval);
    }
    get items() {
        return this._items;
    }
    add(item) {
        if (this.get(item.id) === null) {
            this._items.push(item);
            this.save();
        }
    }
    get(id) {
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].id === id) {
                return this._items[i];
            }
        }
        return null;
    }
    remove(item) {
        const index = this._items.indexOf(item);
        if (index !== -1) {
            this._items.splice(index, 1);
            this.save();
        }
    }
    exists(id) {
        return this.get(id) !== null;
    }
    findByQuery(query) {
        return sift(query, this._items);
    }
    findByServiceId(serviceId) {
        const items = [];
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].data.serviceId === serviceId) {
                items.push(this._items[i]);
            }
        }
        return items;
    }
    findConflicts(networkId, serviceId, start, end) {
        const items = [];
        for (let i = 0, l = this._items.length; i < l; i++) {
            const item = this._items[i];
            if (item.data.networkId === networkId &&
                item.data.serviceId === serviceId &&
                item.data.startAt >= start &&
                item.data.startAt < end) {
                items.push(item);
            }
        }
        return items;
    }
    save() {
        clearTimeout(this._saveTimerId);
        this._saveTimerId = setTimeout(() => this._save(), 3000);
    }
    _load() {
        log.debug("loading programs...");
        const now = Date.now();
        let dropped = false;
        db_1.default.loadPrograms().forEach(program => {
            if (typeof program.networkId === "undefined") {
                dropped = true;
                return;
            }
            if (now > (program.startAt + program.duration)) {
                dropped = true;
                return;
            }
            new ProgramItem_1.default(program, true);
        });
        if (dropped === true) {
            this.save();
        }
    }
    _save() {
        log.debug("saving programs...");
        db_1.default.savePrograms(this._items.map(program => program.data));
    }
    _gc() {
        log.info("Program GC has queued");
        queue_1.default.add(() => {
            const now = Date.now();
            let count = 0;
            this._items.forEach(program => {
                if (now > (program.data.startAt + program.data.duration)) {
                    ++count;
                    program.remove();
                }
            });
            setTimeout(this._gc.bind(this), this._programGCInterval);
            log.info("Program GC has finished and removed %d programs", count);
            return Promise.resolve();
        });
    }
    static add(item) {
        return _1.default.program.add(item);
    }
    static get(id) {
        return _1.default.program.get(id);
    }
    static remove(item) {
        return _1.default.program.remove(item);
    }
    static exists(id) {
        return _1.default.program.exists(id);
    }
    static findByQuery(query) {
        return _1.default.program.findByQuery(query);
    }
    static findByServiceId(serviceId) {
        return _1.default.program.findByServiceId(serviceId);
    }
    static all() {
        return _1.default.program.items;
    }
    static save() {
        return _1.default.program.save();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Program;

//# sourceMappingURL=Program.js.map
