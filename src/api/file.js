const ControlBase = require("../control-base");
const fs = require("fs");
const util = require("../util");
const path = require("path");
const md5File = require("md5-file");
const short = require("short-uuid");
const FileCrypt = require("file-aes-crypt");
const { getFileInfo, upload, download } = require("../file-process");
const { u8aToHex, hexToU8a } = require("@polkadot/util");

module.exports = class FileStorage extends ControlBase {
  constructor(api) {
    super(api);
  }
  //Find my space by walletAddress
  async findPurchasedSpace(walletAddress) {
    try {
      if (!walletAddress) {
        throw "walletAddress is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldSpaceDetails(
        walletAddress
      );
      // return result.toHuman();
      return result.toJSON();
    } catch (e) {
      this.error(e);
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
      this.error(e);
      return e;
    }
  }
  //Find my hold file list by walletAddress
  async findFileList(walletAddress) {
    try {
      if (!walletAddress) {
        throw "walletAddress is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldFileList(
        walletAddress
      );
      return result.toHuman();
    } catch (e) {
      this.error(e);
      return e;
    }
  }
  async findSchedulerIPs(onlyone) {
    return new Promise(async (resolve, reject) => {
      const result = await this.api.query.fileMap.schedulerMap();
      return resolve(this.getIP(result, "ip", onlyone));
      // this.log(result.toHuman());
      // if (result.length == 0) {
      //   return reject("scheduler is not found");
      // }
      // const ips = [];
      // for (let r of result) {
      //   try {
      //     const ip = uint8ArrayToIP(r.ip);
      //     ips.push("ws://" + ip);
      //   } catch (e) {
      //     this.log(e);
      //   }
      // }
      // if (ips.length == 0) {
      //   return reject("ip list is null");
      // }
      // // this.log("ips", ips);
      // if (onlyone) {
      //   return resolve(ips[0]);
      // }
      // resolve(ips);
    });
  }
  async fileUpload(mnemonic, filePath) {
    return new Promise(async (resolve, reject) => {
      try {
        process.on("uncaughtException", function (e) {
          reject(e);
        });
        const { txHash, fileId, publicKeyStr, signStr } =
          await this.getFileUploadTxHash(mnemonic, filePath);
        if (!txHash) {
          return reject();
        }
        await this.fileUploadWithTxHash(
          txHash,
          filePath,
          fileId,
          publicKeyStr,
          signStr
        );
        resolve(fileId);
      } catch (e) {
        this.error(e);
        return reject(e);
      }
    });
  }
  async fileDownload(fileId, fileSaveDir) {
    return new Promise(async (resolve, reject) => {
      const that = this;
      process.on("uncaughtException", function (e) {
        reject(e);
      });
      try {
        if (!fileId) {
          return reject("fileId is null");
        }
        if (!fileSaveDir) {
          return reject("fileSaveDir is null");
        }
        that.progressLog(fileId, "waiting websock ready...");
        await this.api.isReady;
        that.progressLog(
          fileId,
          "websock isready,geting file info from chain..."
        );
        const result = await this.api.query.fileBank.file(fileId);
        that.progressLog(fileId, "load file info complete.");
        const fileInfo = result.toHuman();
        if (!fileInfo || !fileInfo.fileState) {
          that.progressLog(fileId, "file not found.", null, 0, true);
          return reject("File not found.");
        }
        if (fileInfo.fileState != "active") {
          that.progressLog(
            fileId,
            "the file has not been backed up",
            null,
            0,
            true
          );
          return reject("The file has not been backed up");
        }
        that.log("fileInfo", fileInfo);
        // const wsURL =this.getIP(fileInfo.fileDupl,'minerIp',true);
        let fileSavePath = path.join(fileSaveDir, "./") + fileInfo.fileName[0];
        that.progressLog(fileId, "waiting findSchedulerIPs.");

        console.log("fileInfo.sliceInfo", fileInfo.sliceInfo);
        const wsURLs = that.getIP(fileInfo.sliceInfo, "minerIp");
        that.log(wsURLs);
        // this.log('mnemonic.address',mnemonic.address);
        that.progressLog(fileId, "start download...");
        await download(
          fileInfo,
          fileSavePath,
          fileId,
          wsURLs,
          true,
          that.log,
          that.progressLog
        );
        that.progressLog(fileId, "download complete");
        that.progressLog(fileId, "ok", fileSavePath, 0, true);
        resolve(fileSavePath);
      } catch (e) {
        this.error(e);
        reject(e);
      }
    });
  }
  //buy storage
  async expansion(mnemonic, spaceCount, leaseCount, maxPrice) {
    return new Promise(async (resolve, reject) => {
      try {
        let txtHash = await this.getExpansionTxHash(
          mnemonic,
          spaceCount,
          leaseCount,
          maxPrice
        );
        if (!txtHash) {
          return reject();
        }
        let transfterHash = await this.expansionWithTxHash(txtHash);
        resolve(transfterHash);
      } catch (e) {
        this.error(e);
        return reject(e);
      }
    });
  }
  async fileDelete(mnemonic, fileid) {
    try {
      let txtHash = await this.getFileDeleteTxHash(mnemonic, fileid);
      if (!txtHash) {
        return;
      }
      let transfterHash = await this.fileDeleteWithTxHash(txtHash);
      return transfterHash;
    } catch (error) {
      console.error(error);
    }
  }
  async fileEncrypt(filePath, newFilePath, privatekey) {
    const fileCrypt = new FileCrypt(privatekey);
    return fileCrypt.encrypt(filePath, newFilePath);
  }
  async fileDecrypt(filePath, newFilePath, privatekey) {
    const fileCrypt = new FileCrypt(privatekey);
    return fileCrypt.decrypt(filePath, newFilePath);
  }
  async getFileUploadTxHash(mnemonic, filePath) {
    try {
      let { fileId, filename } = await getFileInfo(filePath);
      const txAPI = this.api;
      await txAPI.isReady;
      const tx = txAPI.tx.fileBank.uploadDeclaration(fileId, filename);
      const txHash = await this.sign(mnemonic, tx);
      const { publicKeyStr, signStr } = await this.authSign(mnemonic, "cess");
      return {
        txHash,
        fileId,
        filePath,
        publicKeyStr,
        signStr,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async fileUploadWithTxHash(txHash, filePath, fileid, publicKeyStr, signStr) {
    return new Promise(async (resolve, reject) => {
      const that = this;
      try {
        if (!txHash) {
          that.progressLog(fileid, "txHash is null", null, 0, true);
          throw "txHash is null";
        }
        if (!filePath) {
          that.progressLog(fileid, "filePath is null", null, 0, true);
          throw "filePath is null";
        }
        const publicKey = hexToU8a(publicKeyStr);
        const signU8A = hexToU8a(signStr);
        that.progressLog(fileid, "get file info...");
        that.progressLog(fileid, "waiting socket ready...");
        await this.api.isReady;
        that.progressLog(fileid, "loading scheduler IPs...");
        const wsURLs = await this.findSchedulerIPs();
        if(!wsURLs||wsURLs.length==0){
          return reject('Scheduler not found');
        }

        this.log("fileid:", fileid);

        that.progressLog(fileid, "submit transactioning...");
        const hash = await this.submitTransaction(txHash);
        this.log("transaction success hash:", hash);
        that.progressLog(fileid, "transaction success hash:" + hash);
        this.log("signStr", signStr);
        upload(
          filePath,
          fileid,
          publicKey,
          "cess",
          signU8A,
          wsURLs,
          true,
          that.log,
          that.progressLog
        ).then(resolve, reject);
      } catch (e) {
        this.error("have error and break");
        this.error(e);
        reject(e);
      }
    });
  }
  async getFileDeleteTxHash(mnemonic, fileid) {
    try {
      const txAPI = this.api;
      await txAPI.isReady;
      const tx = txAPI.tx.fileBank.deleteFile(fileid);
      const txHash = await this.sign(mnemonic, tx);
      return txHash;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async getExpansionTxHash(mnemonic, spaceCount, leaseCount, maxPrice) {
    try {
      const txAPI = this.api;
      await txAPI.isReady;
      const tx = txAPI.tx.fileBank.buySpace(spaceCount, leaseCount, maxPrice);
      const txHash = await this.sign(mnemonic, tx);
      return txHash;
    } catch (error) {
      console.error(error);
    }
  }
  async fileDeleteWithTxHash(txHash) {
    return this.submitTransaction(txHash);
  }
  async expansionWithTxHash(txHash) {
    return this.submitTransaction(txHash);
  }
  async authSign(mnemonic, msg) {
    await this.api.isReady;
    let kr = this.keyring;
    const pair = kr.createFromUri(mnemonic);
    kr.setSS58Format(11330);
    const publicKeyU8A = pair.publicKey;
    console.log("publicKeyU8A", publicKeyU8A);
    const ss58 = pair.address;
    const signU8A = pair.sign(msg);
    console.log("signU8A", signU8A);
    const publicKeyStr = u8aToHex(publicKeyU8A);
    const signStr = u8aToHex(signU8A);
    return {
      mnemonic,
      msg,
      publicKeyU8A,
      publicKeyStr,
      signU8A,
      signStr,
      ss58,
    };
  }
};

// async expansion(mnemonic, spaceCount, leaseCount, maxPrice) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       await this.api.isReady;
//       const pair = this.keyring.createFromUri(mnemonic);
//       const extrinsic = this.api.tx.fileBank.buySpace(
//         spaceCount,
//         leaseCount,
//         maxPrice
//       );
//       const extrinsicHash = extrinsic.hash.toHex();
//       const unsub = await extrinsic.signAndSend(pair, (result) => {
//         if (result.status.isInBlock || result.status.isFinalized) {
//           if (!result.dispatchInfo) {
//             return "Cannot get `dispatchInfo` from the result.";
//           }
//           // this.log("extrinsic suceess extrinsicHash:", extrinsicHash);
//           unsub();
//           // return extrinsicHash;
//           resolve(extrinsicHash);
//         } else if (result.status.isDropped) {
//           unsub();
//           reject("isDropped");
//         } else if (result.status.isFinalityTimeout) {
//           unsub();
//           reject(
//             `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
//           );
//         } else if (result.isError) {
//           unsub();
//           reject(result.toHuman());
//         } else {
//           this.log(result.toHuman());
//         }
//       });
//     } catch (e) {
//       this.error(e);
//       return e;
//     }
//   });
// }
// async buySpace(mnemonic, spaceCount, leaseCount, maxPrice) {
//   try {
//     await this.api.isReady;
//     const tx = this.api.tx.fileBank.buySpace(
//       spaceCount,
//       leaseCount,
//       maxPrice
//     );
//     await this.sign(mnemonic, tx);
//     const hash = await this.submitTransaction(tx.toHex());
//     return hash;
//   } catch (error) {
//     console.error(error);
//   }
// }
// async fileDelete(mnemonic, fileid) {
//   try {
//     await this.api.isReady;
//     const tx = this.api.tx.fileBank.deleteFile(fileid);
//     await this.sign(mnemonic, tx);
//     const hash = await this.submitTransaction(tx.toHex());
//     return hash;
//   } catch (error) {
//     console.error(error);
//   }
// }
// async deleteFile(mnemonic, fileid) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       await this.api.isReady;
//       const pair = this.keyring.createFromUri(mnemonic);
//       const extrinsic = this.api.tx.fileBank.deleteFile(fileid);
//       const extrinsicHash = extrinsic.hash.toHex();
//       const unsub = await extrinsic.signAndSend(pair, (result) => {
//         if (result.status.isInBlock || result.status.isFinalized) {
//           if (!result.dispatchInfo) {
//             return "Cannot get `dispatchInfo` from the result.";
//           }
//           this.log("extrinsic suceess extrinsicHash:", extrinsicHash);
//           unsub();
//           // return extrinsicHash;
//           resolve(extrinsicHash);
//         } else if (result.status.isDropped) {
//           unsub();
//           reject("isDropped");
//         } else if (result.status.isFinalityTimeout) {
//           unsub();
//           reject(
//             `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
//           );
//         } else if (result.isError) {
//           unsub();
//           reject(result.toHuman());
//         } else {
//           this.log(result.toHuman());
//         }
//       });
//     } catch (e) {
//       this.error(e);
//       return e;
//     }
//   });
// }
// async fileUpload(mnemonic, filePath, backups, downloadfee, privatekey) {
//   return new Promise(async (resolve, reject) => {
//     const that = this;
//     try {
//       if (!mnemonic) {
//         throw "mnemonic is null";
//       }
//       if (!filePath) {
//         throw "filePath is null";
//       }
//       let ispublic = privatekey ? false : true;
//       if (!ispublic) {
//         await new FileCrypt(privatekey).encrypt(
//           filePath,
//           filePath + ".crypt"
//         );
//         filePath += ".crypt";
//       }
//       const { filehash, filename, filesize } = getFileInfo(filePath);
//       await this.api.isReady;
//       const wsURLs = await this.findSchedulerIPs();
//       const pair = this.keyring.createFromUri(mnemonic);
//       const fileid = short.generate();
//       const extrinsic = this.api.tx.fileBank.upload(
//         pair.address,
//         filename,
//         fileid,
//         filehash,
//         ispublic,
//         backups,
//         filesize,
//         downloadfee
//       );
//       this.log("fileid:", fileid);
//       this.log("filehash:", filehash);
//       const extrinsicHash = extrinsic.hash.toHex();

//       // const signerAccount = this.keyring.getPair(walletAddress);

//       const unsub = await extrinsic.signAndSend(pair, (result) => {
//         // unsub();
//         // this.log(result.status);
//         // this.log('extrinsicHash:',extrinsicHash);
//         if (result.status.isInBlock || result.status.isFinalized) {
//           if (!result.dispatchInfo) {
//             return "Cannot get `dispatchInfo` from the result.";
//           }
//           that.log(
//             " extrinsic status:",
//             result.status.isFinalized,
//             ",hash:",
//             extrinsicHash
//           );
//           unsub();
//           // return;
//           //upload to sminer
//           upload(filePath, fileid, filehash, wsURLs, true, that.log).then(
//             resolve,
//             reject
//           );
//           // return extrinsicHash;
//         } else if (result.status.isDropped) {
//           unsub();
//           return reject("isDropped");
//         } else if (result.status.isFinalityTimeout) {
//           unsub();
//           return reject(
//             `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
//           );
//         } else if (result.isError) {
//           unsub();
//           that.error("error", result.isError);
//           return reject(result.isError);
//         }
//       });
//     } catch (e) {
//       this.error("have error and break");
//       this.error(e);
//       reject(e);
//     }
//   });
// }
