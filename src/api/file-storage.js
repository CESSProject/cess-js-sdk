const ControlBase = require("../control-base");
const bs58 = require("bs58");
const fs = require("fs");
const path = require("path");
const short = require("short-uuid");
const FileCrypt = require("file-aes-crypt");
const { uint8ArrayToIP } = require("../util");
const { getFileInfo, upload, download } = require("../file-process");

module.exports = class ControlApi extends ControlBase {
  constructor(config) {
    super(config);
  }
  //Find curr price
  async findPrice() {
    try {
      await this.api.isReady;
      let result = await this.api.query.sminer.purchasedSpace();
      const purchased = parseFloat(result.toHuman());
      result = await this.api.query.sminer.availableSpace();
      const available = parseFloat(result.toHuman());
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
      return result.toHuman();
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
      return result.toHuman();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find my hold file list by accountId
  async findFileList(accountId) {
    try {
      if (!accountId) {
        throw "accountId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldFileList(accountId);
      return result.toHuman();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  async findSchedulerIPs(onlyone) {
    return new Promise(async (resolve, reject) => {
      const result = await this.api.query.fileMap.schedulerMap();
      // console.log(result.toHuman());
      if (result.length == 0) {
        return reject("scheduler is not found");
      }
      const ips = [];
      for (let r of result) {
        try {
          const ip = uint8ArrayToIP(r.ip);
          ips.push("ws://" + ip);
        } catch (e) {}
      }
      if (ips.length == 0) {
        return reject("ip list is null");
      }
      console.log("ips", ips);
      if (onlyone) {
        return resolve(ips[0]);
      }
      resolve(ips);
    });
  }
  async fileUpload(mnemonic, filePath, privatekey, backups, downloadfee) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mnemonic) {
          throw "mnemonic is null";
        }
        if (!filePath) {
          throw "filePath is null";
        }
        let ispublic = privatekey ? true : false;
        if (!ispublic && privatekey) {
          await new FileCrypt(privatekey).encrypt(
            filePath,
            filePath + ".crypt"
          );
          filePath += ".crypt";
        }
        const { filehash, filename, filesize } = getFileInfo(filePath);
        await this.api.isReady;
        const wsURL = await this.findSchedulerIPs(1);
        const pair = this.keyring.createFromUri(mnemonic);
        const fileid = short.generate();
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
        console.log("fileid:", fileid);
        console.log("filehash:", filehash);
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
            console.log(
              " extrinsic status:",
              result.status.isFinalized,
              ",hash:",
              extrinsicHash
            );
            unsub();
            // return;
            //upload to sminer
            upload(filePath, fileid, filehash, wsURL, true).then(
              resolve,
              reject
            );
            // return extrinsicHash;
          } else if (result.status.isDropped) {
            unsub();
            return reject("isDropped");
          } else if (result.status.isFinalityTimeout) {
            unsub();
            return reject(
              `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
            );
          } else if (result.isError) {
            unsub();
            console.error("error", result.isError);
            return reject(result.isError);
          }
        });
      } catch (e) {
        console.error("have error and break");
        console.error(e);
        reject(e);
      }
    });
  }
  async fileDownload(mnemonic, fileId, fileSaveDir, privatekey) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mnemonic) {
          throw "mnemonic is null";
        }
        if (!fileId) {
          throw "fileId is null";
        }
        if (!fileSaveDir) {
          throw "fileSaveDir is null";
        }
        const fileInfo = await this.findFile(fileId);
        console.log(fileInfo);
        if (!fileInfo.fileState || fileInfo.fileState != "active") {
          throw "The file has not been backed up";
        }
        const fileSavePath = path.join(fileSaveDir, "./") + fileInfo.fileName;
        const wsURL = await this.findSchedulerIPs(1);
        console.log(wsURL);
        await download(fileSavePath, fileId, fileInfo.fileHash, wsURL);
        if (!fileInfo.public && privatekey) {
          fs.renameSync(fileSavePath, fileSavePath + ".crypt");
          await new FileCrypt(privatekey).decrypt(
            fileSavePath + ".crypt",
            fileSavePath
          );
        }
        resolve(fileSavePath);
      } catch (e) {
        console.error(e);
        reject(e);
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
            reject(
              `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
            );
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
            reject(
              `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
            );
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
  async fileEncrypt(filePath, newFilePath, privatekey) {
    const fileCrypt=new FileCrypt(privatekey);
    return fileCrypt.encrypt(filePath, newFilePath);
  }
  async fileDecrypt(filePath, newFilePath, privatekey) {
    const fileCrypt=new FileCrypt(privatekey);
    return fileCrypt.decrypt(filePath, newFilePath);
  }
};
