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
const queue_1 = require("./queue");
const ChannelItem_1 = require("./ChannelItem");
const Tuner_1 = require("./Tuner");
class Channel {
    constructor() {
        this._items = [];
        this._epgGatheringInterval = _1.default.config.server.epgGatheringInterval || 1000 * 60 * 15;
        _1.default.channel = this;
        this._load();
        setTimeout(this._epgGatherer.bind(this), 1000 * 60);
    }
    get items() {
        return this._items;
    }
    add(item) {
        if (this.get(item.type, item.channel) === null) {
            this._items.push(item);
        }
    }
    get(type, channel) {
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].channel === channel && this._items[i].type === type) {
                return this._items[i];
            }
        }
        return null;
    }
    findByType(type) {
        const items = [];
        for (let i = 0, l = this._items.length; i < l; i++) {
            if (this._items[i].type === type) {
                items.push(this._items[i]);
            }
        }
        return items;
    }
    _load() {
        log.debug("loading channels...");
        const channels = _1.default.config.channels;
        channels.forEach((channel, i) => {
            if (typeof channel.name !== "string") {
                log.error("invalid type of property `name` in channel#%d configuration", i);
                return;
            }
            if (channel.type !== "GR" && channel.type !== "BS" && channel.type !== "CS" && channel.type !== "SKY") {
                log.error("invalid type of property `type` in channel#%d (%s) configuration", i, channel.name);
                return;
            }
            if (typeof channel.channel !== "string") {
                log.error("invalid type of property `channel` in channel#%d (%s) configuration", i, channel.name);
                return;
            }
            if (channel.satelite && typeof channel.satelite !== "string") {
                log.error("invalid type of property `satelite` in channel#%d (%s) configuration", i, channel.name);
                return;
            }
            if (channel.serviceId && typeof channel.serviceId !== "number") {
                log.error("invalid type of property `serviceId` in channel#%d (%s) configuration", i, channel.name);
                return;
            }
            if (channel.isDisabled === true) {
                return;
            }
            if (Tuner_1.default.typeExists(channel.type) === false) {
                return;
            }
            new ChannelItem_1.default(channel);
        });
    }
    _epgGatherer() {
        queue_1.default.add(() => {
            const networkIds = [...new Set(_1.default.service.items.map(item => item.networkId))];
            networkIds.forEach(networkId => {
                const services = _1.default.service.findByNetworkId(networkId);
                if (services.length === 0) {
                    return;
                }
                log.info("Network#%d EPG gathering has queued", networkId);
                queue_1.default.add(() => {
                    return new Promise((resolve, reject) => {
                        log.info("Network#%d EPG gathering has started", networkId);
                        Tuner_1.default.getEPG(services[0].channel)
                            .then(() => {
                            log.info("Network#%d EPG gathering has finished", networkId);
                            resolve();
                        })
                            .catch(error => {
                            log.error("Network#%d EPG gathering has failed [%s]", networkId, error);
                            reject();
                        });
                    });
                });
            });
            queue_1.default.add(() => {
                setTimeout(this._epgGatherer.bind(this), this._epgGatheringInterval);
                return Promise.resolve();
            });
            return Promise.resolve();
        });
    }
    static add(item) {
        return _1.default.channel.add(item);
    }
    static get(type, channel) {
        return _1.default.channel.get(type, channel);
    }
    static findByType(type) {
        return _1.default.channel.findByType(type);
    }
    static all() {
        return _1.default.channel.items;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Channel;

//# sourceMappingURL=Channel.js.map
