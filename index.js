/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 * 
 */
const InitAPI = require("./src/init-api");
const Common = require("./src/api/common");
const Authorize = require("./src/api/authorize");
const Space = require("./src/api/space");
const Bucket = require("./src/api/bucket");
const File = require("./src/api/file");

module.exports = {
  InitAPI,
  Common,
  Space, 
  Authorize,
  Bucket,
  File
};
