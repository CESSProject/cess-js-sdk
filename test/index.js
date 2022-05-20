"use strict";
exports.__esModule = true;
var index_js_1 = require("../index.js");
var config = {
    nodeURL: "ws://106.15.44.155:9948/",
    keyringOption: { type: "sr25519", ss58Format: 42 }
};
var fileStorage = new index_js_1.FileStorage(config);
var k = new index_js_1.Keyring(config);
fileStorage.findPrice().then(console.log, console.error);
