const ControlBase = require("../control-base");
const fs = require("fs");
const path = require("path");
const md5File = require("md5-file");
const short = require("short-uuid");
const FileCrypt = require("file-aes-crypt");
const { getFileInfo, upload, download } = require("../file-process");

module.exports = class FileStorage extends ControlBase {
  constructor(config) {
    super(config);
  }
  //Find curr price
  async findPrice() {
    try {
      await this.api.isReady;
      let result = await this.api.query.sminer.purchasedSpace();
      // console.log('result1',result.toJSON())
      const purchased = parseFloat(result.toJSON());
      result = await this.api.query.sminer.availableSpace();
      // console.log('result2',result.toJSON())
      const available = parseFloat(result.toJSON());
      const price = (1024 / parseFloat(available - purchased)) * 1000; //CESS/MB
      return price;
    } catch (e) {
      this.error(e);
      return e;
    }
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
  async fileUpload(mnemonic, filePath, backups, downloadfee, privatekey) {
    return new Promise(async (resolve, reject) => {
      try {
        process.on("uncaughtException", function (e) {
          reject(e);
        });
        const { txHash, fileid } = await this.getFileUploadTxHash(
          mnemonic,
          filePath,
          backups,
          downloadfee,
          null,
          privatekey
        );
        if (!txHash) {
          return reject();
        }
        let transfterHash = await this.fileUploadWithTxHash(
          txHash,
          filePath,
          fileid,
          privatekey
        );
        resolve(fileid);
      } catch (e) {
        this.error(e);
        return reject(e);
      }
    });
  }
  async fileDownload(fileId, fileSaveDir, privatekey) {
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
        let fileSavePath = path.join(fileSaveDir, "./") + fileInfo.fileName;
        that.progressLog(fileId, "waiting findSchedulerIPs.");
        const wsURLs = await this.findSchedulerIPs();
        that.log(wsURLs);
        // this.log('mnemonic.address',mnemonic.address);
        that.progressLog(fileId, "start download...");
        await download(
          fileInfo.userAddr,
          fileSavePath,
          fileId,
          fileInfo.fileHash,
          wsURLs,
          true,
          that.log,
          that.progressLog
        );
        that.progressLog(fileId, "download complete");
        if (!fileInfo.public && privatekey) {
          that.log("start decode file...", fileSavePath);
          const newFilePath = fileSavePath + ".decrypt";
          // const oldFilePath=fileSavePath + ".crypt";
          // fs.renameSync(fileSavePath, oldFilePath);
          // if(!fs.existsSync(oldFilePath)){
          //   return resolve('file not found');
          // }
          try {
            that.progressLog(fileId, "decrypting...");
            const crypt = new FileCrypt(privatekey);
            await crypt.decrypt(fileSavePath, newFilePath);
            fs.unlinkSync(fileSavePath);
            fs.renameSync(newFilePath, fileSavePath);
            that.log("decode success.");
            that.progressLog(fileId, "decode success.");
          } catch (err) {
            that.log("decode err...");
            that.log(err);
            // fs.renameSync(fileSavePath + ".crypt", fileSavePath);
          }
        }
        try {
          that.log("start get md5 hash.");
          that.progressLog(fileId, "start get md5 hash.");
          const fileHash = md5File.sync(fileSavePath);
          if (fileHash != fileInfo.fileHash) {
            // fs.unlinkSync(fileSavePath);
            that.progressLog(fileId, "fileHash not equal.chain");
            return reject(
              "fileHash not equal.chain hash=" +
                fileInfo.fileHash +
                ",but local file hash=" +
                fileHash
            );
          }
        } catch (e) {
          that.progressLog(fileId, "check md5 error");
          that.log("check md5 error");
        }
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
  async getFileUploadTxHash(
    mnemonic,
    filePath,
    backups,
    downloadfee,
    fileid,
    privatekey
  ) {
    try {
      const { filehash, filename, filesize } = getFileInfo(filePath);
      console.log("source file hash:", filehash);
      const ispublic = privatekey ? false : true;
      const txAPI = this.api;

      await txAPI.isReady;
      const pair = this.keyring.createFromUri(mnemonic);
      if (!fileid) {
        fileid = short.generate();
      }
      const tx = txAPI.tx.fileBank.upload(
        pair.address,
        filename,
        fileid,
        filehash,
        ispublic,
        backups,
        filesize,
        downloadfee
      );
      const txHash = await this.sign(mnemonic, tx);
      return { txHash, fileid, filePath, privatekey };
    } catch (error) {
      console.error(error);
      return null;
    }
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
  async fileUploadWithTxHash(txHash, filePath, fileid, privatekey) {
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
        let ispublic = privatekey ? false : true;
        if (!ispublic) {
          that.progressLog(fileid, "encodeing the file...");
          await new FileCrypt(privatekey).encrypt(
            filePath,
            filePath + ".crypt"
          );
          filePath += ".crypt";
        }
        that.progressLog(fileid, "get file info...");
        const { filehash } = getFileInfo(filePath);
        console.log("the hash of encrypt:", filehash, filePath);
        that.progressLog(fileid, "waiting socket ready...");
        await this.api.isReady;
        that.progressLog(fileid, "loading scheduler IPs...");
        const wsURLs = await this.findSchedulerIPs();

        this.log("fileid:", fileid);
        this.log("filehash:", filehash);

        that.progressLog(fileid, "submit transactioning...");
        const hash = await this.submitTransaction(txHash);
        this.log("transaction success hash:", hash);
        that.progressLog(fileid, "transaction success hash:" + hash);
        upload(
          filePath,
          fileid,
          filehash,
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
  async fileDeleteWithTxHash(txHash) {
    return this.submitTransaction(txHash);
  }
  async expansionWithTxHash(txHash) {
    return this.submitTransaction(txHash);
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
