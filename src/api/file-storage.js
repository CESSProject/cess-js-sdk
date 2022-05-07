const ControlBase = require("../control-base");
const bs58 = require("bs58");
const short = require("short-uuid");
module.exports = class ControlApi extends ControlBase {
  constructor(config) {
    super(config);
  }
  async timestamp() {
    await this.api.isReady;
    const result = await this.api.query.timestamp.now();
    return result.toJSON();
  }
  //Find curr price
  async findPrice() {
    try {
      await this.api.isReady;
      let result = await this.api.query.sminer.purchasedSpace();
      const purchased = parseFloat(result.toJSON());
      result = await this.api.query.sminer.availableSpace();
      const available = parseFloat(result.toJSON());
      const price = (1024 / parseFloat(available - purchased)) * 1000; //CESS/MB
      return price;
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find my space by accountId(wallet address)
  async findPurchasedSpace(accountId) {
    try {
      if (!accountId) {
        throw "accountId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldSpaceDetails(
        accountId
      );
      return result.toJSON();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find file info by fileId
  async findFile(fileId) {
    try {
      if (!fileId) {
        throw "fileId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.file(fileId);
      return result.toJSON();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find my hold file list by accountId
  async userHoldFileList(accountId) {
    try {
      if (!accountId) {
        throw "accountId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldFileList(accountId);
      return result.toJSON();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  uint8ArrayToString(u8arr) {
    var dataString = "";
    for (var i = 0; i < u8arr.length; i++) {
      dataString += String.fromCharCode(u8arr[i]);
    }
    return dataString;
  }
  uint8ArrayToIP(u8arr) {
    return this.uint8ArrayToString(bs58.decode(this.uint8ArrayToString(u8arr)));
  }
  async fileUpload(
    mnemonic,
    filename,
    filehash,
    ispublic,
    backups,
    filesize,
    downloadfee
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mnemonic) {
          throw "mnemonic is null";
        }
        if (!filename) {
          throw "filename is null";
        }
        await this.api.isReady;
        // 查询调度信息——>获得所有调度IP:port组合——>上传文件元数据信息——>
        // 选择调度中一个能建立链接的调度——>文件分块块大小自拟，分块通过ws+grpc发送给调度——
        // >得到调度回复收到继续发送下一块(Code=0为正常，其他为异常)——>发送结束句柄关闭
        let result = await this.api.query.fileMap.schedulerMap();
        console.log(result.toJSON());
        for (let r of result) {
          console.log("ws://" + this.uint8ArrayToIP(r.ip));
        }
        // return;
        let ip = this.uint8ArrayToIP(result[result.length - 1].ip);
        let wsURL = "ws://" + ip;
        console.log("wsURL", wsURL);
        // let o={
        //   fileid、filename、filehash、ispublic、backups、filesize、fee
        // };
        // result = await this.api.tx.fileBank.upload(address, filename, fileid, filehash, public, backups, filesize, downloadfee);
        // let address=accountId,
        const pair = this.keyring.createFromUri(mnemonic);
        let fileid = short.generate();
        const extrinsic = this.api.tx.fileBank.upload(
          pair.address,          
          filename,
          fileid,
          filehash,
          ispublic,
          backups,
          filesize,
          downloadfee
        );
        console.log('fileid:',fileid)
        console.log('filehash:',filehash)
        const extrinsicHash = extrinsic.hash.toHex();

        // const signerAccount = this.keyring.getPair(accountId);

        const unsub = await extrinsic.signAndSend(pair, (result) => {
          // unsub();
          // console.log(result.status);
          // console.log('extrinsicHash:',extrinsicHash);
          if (result.status.isInBlock || result.status.isFinalized) {
            if (!result.dispatchInfo) {
              return "Cannot get `dispatchInfo` from the result.";
            }
            console.log("extrinsic suceess extrinsicHash:", extrinsicHash);
            unsub();
            // return extrinsicHash;
          } else if (result.status.isDropped) {
            unsub();
            return "isDropped";
          } else if (result.status.isFinalityTimeout) {
            unsub();
            return `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`;
          } else if (result.isError) {
            unsub();
            console.log("error", result.isError);
          } else {
            console.log(result.toHuman());
          }
        });

        // let result3 = result.toHuman();
        // console.log(result3);
        // console.log(typeof result[1].ip);
        // let ip = parseInt(result[1].ip, 16);
        // let wsURL = "ws://" + this.numToIp(ip);
        // return wsURL;
      } catch (e) {
        console.error(e);
        return e;
      }
    });
  }
  //buy storage
  async expansion(mnemonic, spaceCount, leaseCount, maxPrice) {    
    return new Promise(async (resolve, reject) => {
      try {
        await this.api.isReady;
        const pair = this.keyring.createFromUri(mnemonic);
        const extrinsic = this.api.tx.fileBank.buySpace(
          spaceCount,
          leaseCount,
          maxPrice
        );
        const extrinsicHash = extrinsic.hash.toHex();
        const unsub = await extrinsic.signAndSend(pair, (result) => {
          if (result.status.isInBlock || result.status.isFinalized) {
            if (!result.dispatchInfo) {
              return "Cannot get `dispatchInfo` from the result.";
            }
            console.log("extrinsic suceess extrinsicHash:", extrinsicHash);
            unsub();
            // return extrinsicHash;
            resolve(extrinsicHash);
          } else if (result.status.isDropped) {
            unsub();
            reject("isDropped");
          } else if (result.status.isFinalityTimeout) {
            unsub();
            reject(`Finality timeout at block hash '${result.status.asFinalityTimeout}'.`);
          } else if (result.isError) {
            unsub();
            reject(result.toHuman());
          } else {
            console.log(result.toHuman());
          }
        });
      } catch (e) {
        console.error(e);
        return e;
      }
    });
  }
  async fileDelete(mnemonic, fileid) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.api.isReady;
        const pair = this.keyring.createFromUri(mnemonic);
        const extrinsic = this.api.tx.fileBank.deleteFile(fileid);
        const extrinsicHash = extrinsic.hash.toHex();
        const unsub = await extrinsic.signAndSend(pair, (result) => {
          if (result.status.isInBlock || result.status.isFinalized) {
            if (!result.dispatchInfo) {
              return "Cannot get `dispatchInfo` from the result.";
            }
            console.log("extrinsic suceess extrinsicHash:", extrinsicHash);
            unsub();
            // return extrinsicHash;
            resolve(extrinsicHash);
          } else if (result.status.isDropped) {
            unsub();
            reject("isDropped");
          } else if (result.status.isFinalityTimeout) {
            unsub();
            reject(`Finality timeout at block hash '${result.status.asFinalityTimeout}'.`);
          } else if (result.isError) {
            unsub();
            reject(result.toHuman());
          } else {
            console.log(result.toHuman());
          }
        });
      } catch (e) {
        console.error(e);
        return e;
      }
    });
  }
};
