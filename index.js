// const FileStorage = require("./src/api/file-storage");
// const DataStorage = require("./src/api/data-storage");
// const Keyring = require("./src/keyring");
// const Converter = require("./src/walletAddressConverter");

// module.exports = {
//   FileStorage,
//   DataStorage,
//   Keyring,
//   Converter
// };
module.exports = class OSS {
  constructor(config) {
    this.config = config;
  }
};
OSS.prototype.log = {
  show: function (s) {
    console.log(s);
  },
};


