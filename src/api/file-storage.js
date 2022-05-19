const ControlBase = require("../control-base");
const fs = require("fs");
const path = require("path");
const md5File = require("md5-file");
const short = require("short-uuid");
const FileCrypt = require("file-aes-crypt");
const { uint8ArrayToIP } = require("../util");
const { getFileInfo, upload, download } = require("../file-process");
const { stringToU8a, u8aToHex } = require("@polkadot/util");

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
      // return result.toHuman();
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
  getIP(raw, protoName, onlyone) {
    if (raw.length == 0) {
      return null;
    }
    const ips = [];
    for (let r of raw) {
      try {
        const ip = uint8ArrayToIP(r[protoName]);
        ips.push("ws://" + ip);
      } catch (e) {
        console.log(e);
      }
    }
    if (ips.length == 0) {
      return null;
    }
    // console.log("ips", ips);
    if (onlyone) {
      return ips[0];
    }
    return ips;
  }
  async findSchedulerIPs(onlyone) {
    return new Promise(async (resolve, reject) => {
      const result = await this.api.query.fileMap.schedulerMap();
      return resolve(this.getIP(result, "ip", onlyone));
      // console.log(result.toHuman());
      // if (result.length == 0) {
      //   return reject("scheduler is not found");
      // }
      // const ips = [];
      // for (let r of result) {
      //   try {
      //     const ip = uint8ArrayToIP(r.ip);
      //     ips.push("ws://" + ip);
      //   } catch (e) {
      //     console.log(e);
      //   }
      // }
      // if (ips.length == 0) {
      //   return reject("ip list is null");
      // }
      // // console.log("ips", ips);
      // if (onlyone) {
      //   return resolve(ips[0]);
      // }
      // resolve(ips);
    });
  }
  async fileUpload(mnemonic, filePath, backups, downloadfee, privatekey) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mnemonic) {
          throw "mnemonic is null";
        }
        if (!filePath) {
          throw "filePath is null";
        }
        let ispublic = privatekey ? false : true;
        if (!ispublic) {
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
  async fileDownload(fileId, fileSaveDir, privatekey) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!fileId) {
          return reject("fileId is null");
        }
        if (!fileSaveDir) {
          return reject("fileSaveDir is null");
        }
        await this.api.isReady;
        const result = await this.api.query.fileBank.file(fileId);
        const fileInfo = result.toHuman();
        if (
          !fileInfo ||
          !fileInfo.fileState ||
          fileInfo.fileState != "active"
        ) {
          return reject("The file has not been backed up");
        }
        console.log("fileInfo", fileInfo);
        // const wsURL =this.getIP(fileInfo.fileDupl,'minerIp',true);
        let fileSavePath = path.join(fileSaveDir, "./") + fileInfo.fileName;
        const wsURL = await this.findSchedulerIPs(1);
        console.log(wsURL);
        // console.log('mnemonic.address',mnemonic.address);
        await download(
          fileInfo.userAddr,
          fileSavePath,
          fileId,
          fileInfo.fileHash,
          wsURL,
          true
        );
        const fileHash = md5File.sync(fileSavePath);
        if (fileHash != fileInfo.fileHash) {
          fs.unlinkSync(fileSavePath);
          return reject("fileHash not equal.");
        }
        if (!fileInfo.public && privatekey) {
          // fs.renameSync(fileSavePath, fileSavePath + ".crypt");
          const newFilePath = fileSavePath.replace(".crypt", "");
          try {
            await new FileCrypt(privatekey).decrypt(fileSavePath, newFilePath);
            fs.unlinkSync(fileSavePath);
            fileSavePath = newFilePath;
          } catch (err) {
            console.log(err);
            // fs.renameSync(fileSavePath + ".crypt", fileSavePath);
          }
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
            // console.log("extrinsic suceess extrinsicHash:", extrinsicHash);
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
  async buySpace(mnemonic, spaceCount, leaseCount, maxPrice) {
    // await this.api.isReady;
    // const pair = this.keyring.createFromUri(mnemonic);
    // const extrinsic = this.api.tx.fileBank.buySpace(
    //   spaceCount,
    //   leaseCount,
    //   maxPrice
    // );
    // // let transactionStr = pair.sign(extrinsic.toU8a(true));
    // extrinsic.
    // let message=extrinsic.toU8a(true);
    // const signature = pair.sign(message);
    // const isValid = pair.verify(
    //   message,
    //   signature,
    //   pair.publicKey
    // );
    // console.log('signature.toHuman()',signature.toString());
    // // output the result
    // console.log(`${u8aToHex(signature)} is ${isValid ? "valid" : "invalid"}`);
    // // const extrinsicHash = extrinsic.hash.toHex();
    // // let transactionStr = pair.sign(extrinsic.transaction);
    // // let transactionStr = extrinsic.sign(pair);
    // return this.submitTransaction(signature);
    // // const message = stringToU8a("this is our message");
    // // const signature = alice.sign(message);
    // // const isValid = alice.verify(message, signature, alice.publicKey);
  }
  async submitTransaction(transaction) {
    return new Promise(async (resolve, reject) => {
      await this.api.isReady;
      const api = this.api;
      let tx;
      try {
        tx = api.tx(transaction);
      } catch (err) {
        reject(err);
      }
      try {
        const hash = await api.rpc.author.submitExtrinsic(tx);
        return {
          hash,
        };
      } catch (err) {
        reject(err);
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
    const fileCrypt = new FileCrypt(privatekey);
    return fileCrypt.encrypt(filePath, newFilePath);
  }
  async fileDecrypt(filePath, newFilePath, privatekey) {
    const fileCrypt = new FileCrypt(privatekey);
    return fileCrypt.decrypt(filePath, newFilePath);
  }
};
