const WsProto = require("websocket-grpc");
const fileSlice = require("fs-slicer");
const util = require("../util");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const ProgressBar = require("color-progress-bar");
const wsproto = new WsProto();
const protoFilePath = path.join(__dirname, "ws.proto");
const sha256 = require("sha256");

module.exports = { upload, download, getFileInfo };

async function getFileInfo(filePath) {
  const totleSize = fs.statSync(filePath).size;
  const blockSize = 1073741824; //1G
  let hashStr = "";
  if (totleSize <= blockSize) {
    hashStr = sha256(fs.readFileSync(filePath));
  } else {
    const buffInfoArray = fileSlice.getSliceInfoArr(filePath, blockSize);
    for (const info of buffInfoArray) {
      const buf = await fileSlice.readOneBlock(filePath, info);
      let tmp = sha256(buf);
      hashStr += tmp;
    }
  }
  hashStr = sha256(hashStr);
  return {
    filehash: hashStr,
    fileId: "cess" + hashStr,
    filename: path.basename(filePath),
    filesize: fs.statSync(filePath).size,
  };
}

function upload(
  sourFilePath,
  fileId,
  publicKey,
  msg,
  sign,
  wsUrls,
  showProgressBar,
  log,
  progressLog
) {
  return new Promise(async (resolve, reject) => {
    log("wsUrls", wsUrls);
    for (wsUrl of wsUrls) {
      try {
        log("try connect to ", wsUrl);
        progressLog(fileId, "try connect to " + wsUrl);
        await wsproto.init(wsUrl, protoFilePath, "ReqMsgAuth", "RespMsgAuth");
        if (wsproto.ws.wsIsOpen) {
          break;
        }
      } catch (e) {
        log(wsUrl, "close", e);
      }
    }
    const { filename, filesize } = await getFileInfo(sourFilePath);
    progressLog(fileId, "slicing the file ");
    let blockSize = 102400;
    if (filesize > 209715200) {
      blockSize = 2097152;
    }
    const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, blockSize); // max length 2MB  = 2097152  kb
    log(buffInfoArray);

    const payloadAuth = {
      version: 1,
      id: 2,
      method: "auth",
      service: "wservice",
      body: {
        fileId: fileId,
        fileName: filename,
        fileSize: filesize,
        blockTotal: buffInfoArray.length,
        publicKey: publicKey,
        msg: msg,
        sign: sign,
      },
    };
    let authRes = await wsproto.request(payloadAuth);
    log(authRes);
    if (authRes.body.code === 201) {
      // quick upload
      return resolve(fileId);
    }
    if (authRes.body.code != 200) {
      return reject(authRes);
    }
    const authToken = authRes.body.data;
    // return resolve(authRes);

    let i = 0;

    let progressBar;
    if (showProgressBar) {
      progressBar = new ProgressBar(
        "uploading [:bar] :rate/bps :percent last: :etas",
        {
          width: 50,
          total: filesize,
        }
      );
    }
    for (wsUrl of wsUrls) {
      try {
        log("try connect to ", wsUrl);
        progressLog(fileId, "try connect to " + wsUrl);
        await wsproto.init(wsUrl, protoFilePath, "ReqMsgUpload", "RespMsg");
        if (wsproto.ws.wsIsOpen) {
          break;
        }
      } catch (e) {
        log(wsUrl, "close", e);
      }
    }
    for (const info of buffInfoArray) {
      try {
        i++;
        const buf = await fileSlice.readOneBlock(sourFilePath, info);
        // log(buf.length);continue;
        const payload = {
          version: 1,
          id: 2,
          method: "writefile",
          service: "wservice",
          body: {
            blockIndex: i,
            auth: authToken,
            fileData: buf,
          },
        };
        // console.log('***************payload********************');
        // console.log(payload);
        let per = parseInt((i * 100) / buffInfoArray.length);
        progressLog(fileId, "uploading.... ", null, per);

        let res = await wsproto.request(payload);
        if (showProgressBar) {
          progressBar.tick(buf.length);
        }
        if (res.body.msg != "success") {
          return reject(res.body.msg);
        }
        // log(res);
      } catch (err) {
        console.error(err);
        return reject(err);
      }
    }
    progressLog(fileId, "upload complete!", fileId, 100, true);
    // log("upload complete!");
    resolve(fileId);
  });
}

function download(
  fileInfo,
  newFilePath,
  fileId,
  wsUrls,
  showProgressBar,
  log,
  progressLog
) {
  return new Promise(async (resolve, reject) => {
    const tmpDir = path.join(__dirname, "../../file/chunk/");
    if (fs.existsSync(tmpDir + fileId)) {
      fs.renameSync(tmpDir + fileId, newFilePath);
      log("complete");
      progressLog(fileId, "join file complete.");
      return resolve();
    }
    mkdirp.sync(tmpDir);
    mkdirp.sync(path.dirname(newFilePath));
    const fileName = fileInfo.fileName[0];
    let chunkIndex = 0;
    if (wsUrls.length == 0) {
      return reject();
    }
    let lastWS = "";
    let tmpFileId ='';
    for (wsUrl of wsUrls) {
      tmpFileId = fileInfo.sliceInfo[chunkIndex].shardId;
      if (wsUrls.length > 2 && chunkIndex >= (wsUrls.length * 2) / 3) {
        break;
      }
      if (fs.existsSync(tmpDir + tmpFileId)) {
        chunkIndex++;
        continue;
      }
      if (lastWS != wsUrl || !wsproto.ws.wsIsOpen) {
        try {
          progressLog(fileId, "try connect to " + wsUrl);
          log("try connect to ", wsUrl);
          await wsproto.init(wsUrl, protoFilePath, "ReqMsgDownload", "RespMsg");
          if (!wsproto.ws.wsIsOpen) {
            continue;
          }
          lastWS = wsUrl;
        } catch (e) {
          log(e);
        }
        progressLog(fileId, "downloading.... from " + wsUrl);
        log("downloading....");
      }
      let isFinish = false;
      let bufs = [];
      let blockTotal = 1;
      let blockIndex = 1;

      let i = 0;
      chunkIndex++;

      while (!isFinish) {
        try {
          i++;
          var payload = {
            version: 1,
            id: 2,
            method: "readfile",
            service: "mservice",
            body: {
              fileId: tmpFileId,
              blockIndex,
            },
          };
          // log('ws req json:');
          // log(payload);
          let json = await wsproto.request(payload);
          // log('ws res json:');
          // log(json);
          if (
            json.body.msg &&
            json.body.msg == "success" &&
            json.body.data.data
          ) {
            // fs.writeFileSync("b.txt", json.body.data.data);
            // log("index=" + blockTotal, "size=" + json.body.data.data.length);
            bufs.push(json.body.data.data);
            // fs.writeFileSync('./file/slice/'+i, json.body.data.data);
            blockIndex = json.body.data.blockIndex;
            blockTotal = json.body.data.blockTotal;
            let per = parseInt((blockIndex * 100) / blockTotal);
            progressLog(fileId, "downloading.... ", null, per);
            // log("blockIndex:", blockIndex, "blockTotal:", blockTotal);
            if (showProgressBar) {
              if (i === 1) {
                log("chunk " + chunkIndex + " total blockTotal:", blockTotal);
                progressBar = new ProgressBar(
                  "downloading chunk " +
                    chunkIndex +
                    " [:bar] :percent :current/:total",
                  {
                    width: 50,
                    total: blockTotal,
                  }
                );
                progressBar.tick();
              } else {
                progressBar.tick();
              }
            }
            if (blockIndex < blockTotal) {
              blockIndex++;
              isFinish = false;
            } else {
              isFinish = true;
            }
          } else {
            // log(json);
            isFinish = true;
          }
        } catch (e) {
          console.error(e);
        }
      }
      await fileSlice.joinBlcoksToFile(tmpDir + tmpFileId, bufs);
      log("chunk " + chunkIndex + " download finish");
    }
    if (chunkIndex == 0) {
      return reject();
    } else if (chunkIndex == 1) {
      await fs.renameSync(tmpDir + tmpFileId, newFilePath);
    } else {
      const reedResult = await util.reedsolomonDecode(
        tmpDir,
        fileId,
        wsUrls.length
      );
      if (reedResult.msg == "ok" && fs.existsSync(tmpDir + fileId)) {
        fs.renameSync(tmpDir + fileId, newFilePath);
      }
    }
    progressLog(fileId, "download finish and joining file with blocks.");
    log("complete");
    progressLog(fileId, "join file complete.");
    resolve();
  });
}
