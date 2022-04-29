"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var api_1 = require("@polkadot/api");
exports.default = (function (config) {
    if (config === void 0) { config = config_1.default; }
    var wsProvider = new api_1.WsProvider(config.nodeURL);
    var api = new api_1.ApiPromise({ provider: wsProvider });
    var keyring = new api_1.Keyring(config.keyringOption);
    return { api: api, keyring: keyring };
});
