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
const fs = require("fs");
const http = require("http");
const express = require("express");
const openapi = require("express-openapi");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const yaml = require("js-yaml");
const log = require("./log");
const regexp_1 = require("./regexp");
const system_1 = require("./system");
const _1 = require("./_");
const pkg = require("../../package.json");
class Server {
    constructor() {
        this._servers = [];
        const serverConfig = _1.default.config.server;
        let addresses = [];
        if (serverConfig.path) {
            addresses.push(serverConfig.path);
        }
        if (serverConfig.port) {
            addresses = [...addresses, ...system_1.default.getPrivateIPv4Addresses(), "127.0.0.1"];
        }
        const app = express();
        app.disable("x-powered-by");
        app.use(morgan(":remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :user-agent"));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use((req, res, next) => {
            res.setHeader("Server", "Mirakurun/" + pkg.version);
            next();
        });
        const api = yaml.safeLoad(fs.readFileSync("api.yml", "utf8"));
        api.info.version = pkg.version;
        openapi.initialize({
            app: app,
            apiDoc: api,
            docsPath: "/docs",
            routes: "./lib/Mirakurun/api"
        });
        app.use((err, req, res, next) => {
            log.error(JSON.stringify(err, null, "  "));
            console.error(err.stack);
            if (res.headersSent === false) {
                res.writeHead(err.status || 500, {
                    "Content-Type": "application/json"
                });
            }
            res.end(JSON.stringify({
                code: res.statusCode,
                reason: err.message || res.statusMessage,
                errors: err.errors
            }));
            next();
        });
        addresses.forEach(address => {
            const server = http.createServer(app);
            server.timeout = 1000 * 60 * 3; // 3 minutes
            if (regexp_1.default.unixDomainSocket.test(address) === true || regexp_1.default.windowsNamedPipe.test(address) === true) {
                if (process.platform !== "win32" && fs.existsSync(address) === true) {
                    fs.unlinkSync(address);
                }
                server.listen(address, () => {
                    log.info("listening on http+unix://%s", address.replace(/\//g, "%2F"));
                });
                if (process.platform !== "win32") {
                    fs.chmodSync(address, "777");
                }
            }
            else {
                server.listen(serverConfig.port, address, () => {
                    log.info("listening on http://%s:%d", address, serverConfig.port);
                });
            }
            this._servers.push(server);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;

//# sourceMappingURL=Server.js.map
