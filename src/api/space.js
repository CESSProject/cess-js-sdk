const ControlBase = require("../control-base");
const short = require("short-uuid");
const { getFileInfo } = require("../file-process");

module.exports = class DataStorage extends ControlBase {
  constructor(api) {
    super(api);
  }

  async userOwnedSpace(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.storageHandler.userOwnedSpace(accountId32);
      return {
        msg: "ok",
        data: ret,
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
  async getRetrieveTxHash(mnemonic, fileid) {
    try {
      const txAPI = this.api;
      await txAPI.isReady;
      const tx = txAPI.tx.dataStore.retrieve(fileid);
      const txHash = await this.sign(mnemonic, tx);
      return { txHash, fileid };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async getReplaceTxHash(mnemonic, filePath, oldFileid, newFileid, keyword) {
    try {
      const { filehash, filename, filesize } = getFileInfo(filePath);
      console.log("source file hash:", filehash);
      const txAPI = this.api;

      await txAPI.isReady;
      if (!newFileid) {
        newFileid = short.generate();
      }
      //replace(oldFileid, newFileid, pfilename, filesize, pkeywords)
      const tx = txAPI.tx.dataStore.replace(
        oldFileid,
        newFileid,
        filename,
        filesize,
        keyword
      );
      const txHash = await this.sign(mnemonic, tx);
      return { txHash, oldFileid, newFileid, filePath };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async getDeleteTxHash(mnemonic, fileid) {
    try {
      const txAPI = this.api;
      await txAPI.isReady;
      //delete(pfileid)
      const tx = txAPI.tx.dataStore.delete(fileid);
      const txHash = await this.sign(mnemonic, tx);
      return { txHash, fileid };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};
