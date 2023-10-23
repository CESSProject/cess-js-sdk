/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */
const InitAPI = require("./init-api");
const Common = require("./api/common");
const Authorize = require("./api/authorize");
const Space = require("./api/space");
const Bucket = require("./api/bucket");
const File = require("./api/file");
const { buildConfig, testnetConfig, wellKnownAcct } = require("./config.js");

module.exports = {
  Authorize,
  Bucket,
  buildConfig,
  Common,
  File,
  InitAPI,
  Space,
  testnetConfig,
  wellKnownAcct,
};
