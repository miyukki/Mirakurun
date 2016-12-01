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
const _1 = require("./_");
const queue_1 = require("./queue");
const log = require("./log");
const ServiceItem_1 = require("./ServiceItem");
class ChannelItem {
    constructor(config) {
        const pre = _1.default.channel.get(config.type, config.channel);
        if (pre !== null) {
            if (config.serviceId) {
                pre.addService(config.serviceId);
            }
            return pre;
        }
        this._name = config.name;
        this._type = config.type;
        this._channel = config.channel;
        this._satelite = config.satelite;
        if (config.serviceId) {
            this.addService(config.serviceId);
        }
        setTimeout(() => {
            if (!config.serviceId && this.getServices().length === 0) {
                this.serviceScan(true);
            }
            else {
                setTimeout(() => this.serviceScan(false), 180000);
            }
        }, 3000);
        _1.default.channel.add(this);
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get channel() {
        return this._channel;
    }
    get satelite() {
        return this._satelite;
    }
    export() {
        return {
            type: this._type,
            channel: this._channel,
            name: this._name,
            satelite: this._satelite
        };
    }
    addService(serviceId) {
        if (!_1.default.service) {
            process.nextTick(() => this.addService(serviceId));
            return;
        }
        if (_1.default.service.findByChannel(this).some(service => service.serviceId === serviceId) === true) {
            return;
        }
        log.info("ChannelItem#'%s' serviceId=%d check has queued", this._name, serviceId);
        queue_1.default.add(() => {
            return new Promise((resolve, reject) => {
                log.info("ChannelItem#'%s' serviceId=%d check has started", this._name, serviceId);
                _1.default.tuner.getServices(this)
                    .then(services => services.find(service => service.serviceId === serviceId))
                    .then(service => {
                    log.debug("ChannelItem#'%s' serviceId=%d: %s", this._name, serviceId, JSON.stringify(service, null, "  "));
                    new ServiceItem_1.default(this, service.networkId, service.serviceId, service.name, service.type, service.logoId);
                    resolve();
                })
                    .catch(error => {
                    log.info("ChannelItem#'%s' serviceId=%d check has failed [%s]", this._name, serviceId, error);
                    setTimeout(() => this.addService(serviceId), 180000);
                    reject();
                });
            });
        });
    }
    getServices() {
        return _1.default.service.findByChannel(this);
    }
    getStream(user) {
        return _1.default.tuner.getChannelStream(this, user);
    }
    serviceScan(add) {
        log.info("ChannelItem#'%s' service scan has queued", this._name);
        queue_1.default.add(() => {
            return new Promise((resolve, reject) => {
                log.info("ChannelItem#'%s' service scan has started", this._name);
                _1.default.tuner.getServices(this)
                    .then(services => {
                    log.debug("ChannelItem#'%s' services: %s", this._name, JSON.stringify(services, null, "  "));
                    services.forEach(service => {
                        const item = _1.default.service.get(service.networkId, service.serviceId);
                        if (item !== null) {
                            item.name = service.name;
                            item.type = service.type;
                            item.logoId = service.logoId;
                        }
                        else if (add === true) {
                            new ServiceItem_1.default(this, service.networkId, service.serviceId, service.name, service.type, service.logoId);
                        }
                    });
                    log.info("ChannelItem#'%s' service scan has finished", this._name);
                    resolve();
                })
                    .catch(error => {
                    log.error("ChannelItem#'%s' service scan has failed [%s]", this._name, error);
                    setTimeout(() => this.serviceScan(add), add ? 180000 : 3600000);
                    reject();
                });
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChannelItem;

//# sourceMappingURL=ChannelItem.js.map
