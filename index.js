if (global) {
  global.window = {};
}else{
  window.global={};
}

const Authorize = require("./src/api/authorize");
const Space = require("./src/api/space");
const InitAPI = require("./src/init-api");
const Common = require("./src/api/common");
// const Keyring = require("./src/keyring");
// const Converter = require("./src/walletAddressConverter");

module.exports = {
  InitAPI,
  Common,
  Space, 
  Authorize
  // File,
  // Keyring,
  // Converter
};
