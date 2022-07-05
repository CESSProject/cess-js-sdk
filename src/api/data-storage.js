const ControlBase = require("../control-base");
const short = require("short-uuid");
const { getFileInfo } = require("../file-process");

module.exports = class DataStorage extends ControlBase {
  constructor(config) {
    super(config);
  }

  async getStoreTxHash(mnemonic, filePath, fileid, keyword) {
    try {
      const { filehash, filename, filesize } =await getFileInfo(filePath);
      console.log("source file hash:", filehash);
      const txAPI = this.api;

      await txAPI.isReady;
      if (!fileid) {
        fileid = short.generate();
      }
      //store(pfileid, pfilename, filesize, pkeywords)
      const tx = txAPI.tx.dataStore.store(fileid, filename, filesize, keyword);
      const txHash = await this.sign(mnemonic, tx);
      return { txHash, fileid, filePath };
    } catch (error) {
      console.error(error);
      return null;
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
