const initApi = require("./init-api");

module.exports = class ControlBase {
  constructor(config) {
    if (config && !config.nodeURL && config.api && config.keyring) {
      this.api = config.api;
      this.keyring = config.keyring;
      return;
    }
    const apiObj = initApi(config);
    this.api = apiObj.api;
    this.keyring = apiObj.keyring;
  }
};
