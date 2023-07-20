if (global) {
  global.window = {};
}else{
  window.global={};
}

const InitAPI = require("./src/init-api");
const Common = require("./src/api/common");
const Authorize = require("./src/api/authorize");
const Space = require("./src/api/space");
const Bucket = require("./src/api/bucket");
const File = require("./src/api/file");

const Keyring = require("./src/keyring");
const Converter = require("./src/walletAddressConverter");

module.exports = {
  InitAPI,
  Common,
  Space, 
  Authorize,
  Bucket,
  File,
  Keyring,
  Converter
};
