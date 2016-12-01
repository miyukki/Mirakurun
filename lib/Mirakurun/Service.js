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
const ServiceItem_1 = require("./ServiceItem");
class Service {
    constructor() {
        this._items = [];
        _1.default.service = this;
        this._load();
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
    get(id, serviceId) {
        if (typeof serviceId === "undefined") {
            for (let i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i].id === id) {
                    return this._items[i];
                }
            }
        }
        else {
            for (let i = 0, l = this._items.length; i < l; i++) {
                if (this._items[i].networkId === id && this._items[i].serviceId === serviceId) {
                    return this._items[i];
                }
            }
        }
        return null;
    }
    exists(id, serviceId) {
        return this.get(id, serviceId) !== null;
    }
    findByChannel(channel) {
        const items = [];
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].channel === channel) {
                items.push(this._items[i]);
            }
        }
        return items;
    }
    findByNetworkId(networkId) {
        const items = [];
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].networkId === networkId) {
                items.push(this._items[i]);
            }
        }
        return items;
    }
    findByNetworkIdWithLogoId(networkId, logoId) {
        const items = [];
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].networkId === networkId && this._items[i].logoId === logoId) {
                items.push(this._items[i]);
            }
        }
        return items;
    }
    save() {
        clearTimeout(this._saveTimerId);
        this._saveTimerId = setTimeout(() => this._save(), 500);
    }
    _load() {
        log.debug("loading services...");
        let dropped = false;
        db_1.default.loadServices().forEach(service => {
            const channelItem = _1.default.channel.get(service.channel.type, service.channel.channel);
            if (channelItem === null) {
                dropped = true;
                return;
            }
            if (typeof service.networkId === "undefined" || typeof service.serviceId === "undefined") {
                dropped = true;
                return;
            }
            new ServiceItem_1.default(channelItem, service.networkId, service.serviceId, service.name, service.type, service.logoId, service.logoData);
        });
        if (dropped === true) {
            this.save();
        }
    }
    _save() {
        log.debug("saving services...");
        db_1.default.saveServices(this._items.map(service => service.export(true)));
    }
    static add(item) {
        return _1.default.service.add(item);
    }
    static get(id, serviceId) {
        return _1.default.service.get(id, serviceId);
    }
    static exists(id, serviceId) {
        return _1.default.service.exists(id, serviceId);
    }
    static findByChannel(channel) {
        return _1.default.service.findByChannel(channel);
    }
    static findByNetworkId(networkId) {
        return _1.default.service.findByNetworkId(networkId);
    }
    static findByNetworkIdWithLogoId(networkId, logoId) {
        return _1.default.service.findByNetworkIdWithLogoId(networkId, logoId);
    }
    static all() {
        return _1.default.service.items;
    }
    static save() {
        return _1.default.service.save();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Service;

//# sourceMappingURL=Service.js.map
