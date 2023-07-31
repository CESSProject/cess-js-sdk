const ControlBase = require("../control-base");
const config = require("../config");
const fileHelper = require("../util/file-helper");
const bs58 = require("bs58");
const { formatterSize } = require("../util/formatter");

module.exports = class File extends ControlBase {
  constructor(api, keyring, isDebug) {
    super(api, keyring, isDebug);
  }
  async queryFileListFull(accountId32) {
    try {
      let ret =await this.queryFileList(accountId32);
      if(ret.msg!='ok'){
        return ret;
      }
      for(let file of ret.data){
        let tmp=await this.queryFileMetadata(file.fileHash);
        if(tmp.msg=='ok'){
          // console.log(tmp.data.owner);
          let owe=tmp.data.owner.find(t=>t.user==accountId32);
          if(owe){
            file.fileName=owe.fileName;
            file.bucketName=owe.bucketName;            
          }
          file.fileSizeStr = formatterSize(tmp.data.fileSize);
          file.stat=tmp.data.stat;
        }
      }
      return ret;
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async queryFileList(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.userHoldFileList(accountId32);
      let data2 = ret.toHuman();
      let data = ret.toJSON();
      let list = [];
      data.forEach((t, i) => {
        t.fileHash = data2[i].fileHash;
        t.fileSizeStr = formatterSize(t.fileSize);
      });
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
      console.log({signU8A})
      let sign = bs58.encode(signU8A);
      if(!sign){
        console.log('sign error');
        return {
          msg:'sign error'
        }
      }
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
