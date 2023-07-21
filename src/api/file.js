const ControlBase = require("../control-base");
const config = require("../config");
const fileHelper = require("../util/file-helper");
const bs58 = require("bs58");

module.exports = class File extends ControlBase {
  constructor(api, keyring, isDebug) {
    super(api, keyring, isDebug);
  }
  async queryFileList(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.file(accountId32);
      let data = ret.toHuman();
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async queryFileMetadata(fileHash) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.file(fileHash);
      let hu = ret.toHuman();
      let data = ret.toJSON();
      if (data && data.owner && data.owner.length > 0) {
        for (let i = 0; i < data.owner.length; i++) {
          data.owner[i].fileName = hu.owner[i].fileName;
          data.owner[i].bucketName = hu.owner[i].bucketName;
        }
      }
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async uploadFile(mnemonic, accountId32, filePath, bucketName) {
    try {
      let message = "cess-js-sdk-" + new Date().valueOf();
      const { signU8A } = await this.authSign(mnemonic, message);
      let sign = bs58.encode(signU8A);
      let headers = {};
      headers["BucketName"] = bucketName;
      headers["Account"] = accountId32;
      headers["Message"] = message;
      headers["Signature"] = sign;
      let ret = await fileHelper.upload(
        config.gateway.url,
        filePath,
        headers,
        this.log
      );
      return ret;
    } catch (e) {
      console.log(e);
      return { msg: "error", error: e.message };
    }
  }
  async downloadFile(fileHash, savePath) {
    let url = config.gateway.url + fileHash;
    let ret = await fileHelper.download(url, savePath, this.log);
    return ret;
  }
  async deleteFile(mnemonic, accountId32, fileHashArray) {
    await this.api.isReady;
    const extrinsic = this.api.tx.fileBank.deleteFile(
      accountId32,
      fileHashArray
    );
    return await this.signAndSend(mnemonic, extrinsic);
  }
};
