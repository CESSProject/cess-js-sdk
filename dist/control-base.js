"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var init_api_1 = require("./init-api");
var ControlBase = /** @class */ (function () {
    function ControlBase(config) {
        var apiObj = (0, init_api_1.default)(config);
        this.api = apiObj.api;
        this.keyring = apiObj.keyring;
    }
    return ControlBase;
}());
exports.default = ControlBase;
