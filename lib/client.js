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
/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/js-yaml/index.d.ts" />
"use strict";
const fs = require("fs");
const http = require("http");
const querystring = require("querystring");
const yaml = require("js-yaml");
const pkg = require("../package.json");
const spec = yaml.safeLoad(fs.readFileSync(__dirname + "/../api.yml", "utf8"));
class Client {
    constructor() {
        this.basePath = spec.basePath;
        /** positive integer */
        this.priority = 0;
        this.host = "";
        this.port = 40772;
        this.socketPath = process.platform === "win32" ? "\\\\.\\pipe\\mirakurun" : "/var/run/mirakurun.sock";
        /** provide User-Agent string to identify client. */
        this.userAgent = "";
        this._userAgent = `MirakurunClient/${pkg.version} Node/${process.version} (${process.platform})`;
    }
    _httpRequest(method, path, option = {}) {
        const opt = {
            path: this.basePath + path,
            headers: option.headers || {},
            agent: this.agent
        };
        if (this.host === "") {
            opt.socketPath = this.socketPath;
        }
        else {
            opt.host = this.host;
            opt.port = this.port;
        }
        if (this.userAgent === "") {
            opt.headers["User-Agent"] = this._userAgent;
        }
        else {
            opt.headers["User-Agent"] = this.userAgent + " " + this._userAgent;
        }
        if (option.priority === undefined) {
            option.priority = this.priority;
        }
        opt.headers["X-Mirakurun-Priority"] = option.priority.toString(10);
        if (typeof option.query === "object") {
            path += "?" + querystring.stringify(option.query);
        }
        if (typeof option.body === "object") {
            opt.headers["Content-Type"] = "application/json; charset=utf-8";
            option.body = JSON.stringify(option.body);
        }
        return new Promise((resolve, reject) => {
            const req = http.request(opt, res => {
                if (res.statusCode > 300 && res.statusCode < 400 && res.headers["location"]) {
                    if (/^\//.test(res.headers["location"]) === false) {
                        reject(new Error(`Error: Redirecting location "${res.headers["location"]}" isn't supported.`));
                        return;
                    }
                    this._httpRequest(method, res.headers["location"], option)
                        .then(resolve, reject);
                    return;
                }
                resolve(res);
            });
            req.on("error", reject);
            // write request body
            if (typeof option.body === "string") {
                req.write(option.body + "\n");
            }
            req.end();
        });
    }
    _requestStream(method, path, option = {}) {
        return new Promise((resolve, reject) => {
            this._httpRequest(method, path, option).then(res => {
                if (res.statusCode >= 200 && res.statusCode <= 202) {
                    resolve(res);
                }
                else {
                    reject(res);
                }
            }, err => reject(err));
        });
    }
    _getTS(path, decode = true) {
        const option = {
            query: {
                decode: decode ? "1" : "0"
            }
        };
        return new Promise((resolve, reject) => {
            this._requestStream("GET", path, option).then(res => {
                if (res.headers["content-type"] === "video/MP2T") {
                    resolve(res);
                }
                else {
                    reject(res);
                }
            }, err => reject(err));
        });
    }
    request(method, path, option = {}) {
        return new Promise((resolve, reject) => {
            this._httpRequest(method, path, option).then(res => {
                const ret = {
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    contentType: res.headers["content-type"].split(";")[0],
                    headers: res.headers,
                    isSuccess: (res.statusCode >= 200 && res.statusCode <= 202)
                };
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                res.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    if (ret.contentType === "application/json") {
                        ret.body = JSON.parse(buffer.toString("utf8"));
                    }
                    else {
                        ret.body = buffer;
                    }
                    if (ret.isSuccess === true) {
                        resolve(ret);
                    }
                    else {
                        reject(ret);
                    }
                });
            }, err => {
                const ret = {
                    status: -1,
                    statusText: "Request Failure",
                    contentType: "",
                    headers: {},
                    isSuccess: false,
                    body: err
                };
                reject(ret);
            });
        });
    }
    getChannels(query) {
        return this.request("GET", "/channels", { query: query })
            .then(res => Promise.resolve(res.body));
    }
    getChannelsByType(type, query) {
        return this.request("GET", `/channels/${type}`, { query: query })
            .then(res => Promise.resolve(res.body));
    }
    getChannel(type, channel) {
        return this.request("GET", `/channels/${type}/${channel}`)
            .then(res => Promise.resolve(res.body));
    }
    getServicesByChannel(type, channel) {
        return this.request("GET", `/channels/${type}/${channel}/services`)
            .then(res => Promise.resolve(res.body));
    }
    getServiceByChannel(type, channel, sid) {
        return this.request("GET", `/channels/${type}/${channel}/services/${sid}`)
            .then(res => Promise.resolve(res.body));
    }
    getServiceStreamByChannel(type, channel, sid, decode) {
        return this._getTS(`/channels/${type}/${channel}/services/${sid}/stream`, decode)
            .then(res => Promise.resolve(res));
    }
    getChannelStream(type, channel, decode) {
        return this._getTS(`/channels/${type}/${channel}/stream`, decode)
            .then(res => Promise.resolve(res));
    }
    getPrograms(query) {
        return this.request("GET", "/programs", { query: query })
            .then(res => Promise.resolve(res.body));
    }
    getProgram(id) {
        return this.request("GET", `/programs/${id}`)
            .then(res => Promise.resolve(res.body));
    }
    getProgramStream(id, decode) {
        return this._getTS(`/programs/${id}/stream`, decode)
            .then(res => Promise.resolve(res));
    }
    getServices(query) {
        return this.request("GET", "/services", { query: query })
            .then(res => Promise.resolve(res.body));
    }
    getService(id) {
        return this.request("GET", `/services/${id}`)
            .then(res => Promise.resolve(res.body));
    }
    getLogoImage(id) {
        return this.request("GET", `/services/${id}/logo`)
            .then(res => Promise.resolve(res.body));
    }
    getServiceStream(id, decode) {
        return this._getTS(`/services/${id}/stream`, decode)
            .then(res => Promise.resolve(res));
    }
    getTuners() {
        return this.request("GET", "/tuners")
            .then(res => Promise.resolve(res.body));
    }
    getTuner(index) {
        return this.request("GET", `/tuners/${index}`)
            .then(res => Promise.resolve(res.body));
    }
    getTunerProcess(index) {
        return this.request("GET", `/tuners/${index}/process`)
            .then(res => Promise.resolve(res.body));
    }
    killTunerProcess(index) {
        return this.request("DELETE", `/tuners/${index}/process`)
            .then(res => Promise.resolve(res.body));
    }
    getEvents() {
        return this.request("GET", "/events")
            .then(res => Promise.resolve(res.body));
    }
    getEventsStream(query) {
        return this._requestStream("GET", "/events/stream", { query: query })
            .then(res => Promise.resolve(res));
    }
    getChannelsConfig() {
        return this.request("GET", "/config/channels")
            .then(res => Promise.resolve(res.body));
    }
    updateChannelsConfig(channels) {
        return this.request("PUT", "/config/channels", { body: channels })
            .then(res => Promise.resolve(res.body));
    }
    getServerConfig() {
        return this.request("GET", "/config/server")
            .then(res => Promise.resolve(res.body));
    }
    updateServerConfig(server) {
        return this.request("PUT", "/config/server", { body: server })
            .then(res => Promise.resolve(res.body));
    }
    getTunersConfig() {
        return this.request("GET", "/config/tuners")
            .then(res => Promise.resolve(res.body));
    }
    updateTunersConfig(tuners) {
        return this.request("PUT", "/config/tuners", { body: tuners })
            .then(res => Promise.resolve(res.body));
    }
    getLog() {
        return this.request("GET", "/log")
            .then(res => Promise.resolve(res.body));
    }
    getLogStream() {
        return this._requestStream("GET", "/log/stream")
            .then(res => Promise.resolve(res));
    }
    checkVersion() {
        return this.request("GET", "/version")
            .then(res => Promise.resolve(res.body));
    }
    updateVersion(force) {
        return this._requestStream("PUT", "/log/stream", { query: { force: force } })
            .then(res => Promise.resolve(res));
    }
    getStatus() {
        return this.request("GET", "/status")
            .then(res => Promise.resolve(res.body));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Client;

//# sourceMappingURL=client.js.map
