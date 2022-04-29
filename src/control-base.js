const initApi = require("./init-api");

module.exports = class ControlBase {
  constructor(config) {
    const apiObj = initApi(config);
    this.api = apiObj.api;
    this.keyring = apiObj.keyring;
  }
};
