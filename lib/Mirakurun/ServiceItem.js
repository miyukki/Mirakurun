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
const Event_1 = require("./Event");
class ServiceItem {
    constructor(_channel, _networkId, _serviceId, _name, _type, _logoId, _logoData) {
        this._channel = _channel;
        this._networkId = _networkId;
        this._serviceId = _serviceId;
        this._name = _name;
        this._type = _type;
        this._logoId = _logoId;
        this._logoData = _logoData;
        this._id = ServiceItem.createId(_networkId, _serviceId);
        if (_1.default.service.exists(this._id) === true) {
            return this;
        }
        _1.default.service.add(this);
        Event_1.default.emit("service", "create", this.export());
    }
    get id() {
        return this._id;
    }
    get networkId() {
        return this._networkId;
    }
    get serviceId() {
        return this._serviceId;
    }
    get name() {
        return this._name || "";
    }
    get type() {
        return this._type;
    }
    get logoId() {
        return this._logoId;
    }
    get logoData() {
        return new Buffer(this._logoData, "base64");
    }
    get hasLogoData() {
        return !!this._logoData;
    }
    get channel() {
        return this._channel;
    }
    set name(name) {
        if (this._name !== name) {
            this._name = name;
            _1.default.service.save();
            this._updated();
        }
    }
    set type(type) {
        if (this._type !== type) {
            this._type = type;
            _1.default.service.save();
            this._updated();
        }
    }
    set logoId(logoId) {
        if (this._logoId !== logoId) {
            this._logoId = logoId;
            _1.default.service.save();
            this._updated();
        }
    }
    set logoData(logo) {
        if (this._logoData !== logo.toString("base64")) {
            this._logoData = logo.toString("base64");
            _1.default.service.save();
            this._updated();
        }
    }
    export(full = false) {
        const ret = {
            id: this._id,
            serviceId: this._serviceId,
            networkId: this._networkId,
            name: this._name || "",
            type: this._type,
            logoId: this._logoId,
            channel: {
                type: this._channel.type,
                channel: this._channel.channel
            }
        };
        if (full === true) {
            ret.logoData = this._logoData;
        }
        return ret;
    }
    getStream(user) {
        return _1.default.tuner.getServiceStream(this, user);
    }
    _updated() {
        Event_1.default.emit("service", "update", this.export());
    }
    static createId(networkId, serviceId) {
        return parseInt(networkId + (serviceId / 100000).toFixed(5).slice(2), 10);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServiceItem;

//# sourceMappingURL=ServiceItem.js.map
