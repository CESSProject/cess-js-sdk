const WsProto = require("websocket-grpc");
const fileSlice = require("fs-slicer");
const md5File = require("md5-file");
const path = require("path");
const fs = require("fs");
const ProgressBar = require("color-progress-bar");
const wsproto = new WsProto();
const protoFilePath = path.join(__dirname, "ws.proto");

module.exports = { upload, download, getFileInfo };

function getFileInfo(filePath) {
  return {
    filehash: md5File.sync(filePath),
    filename: path.basename(filePath),
    filesize: fs.statSync(filePath).size,
  };
}

function upload(
  sourFilePath,
  fileId,
  fileHash,
  wsUrls,
  showProgressBar,
  log,
  progressLog
) {
  return new Promise(async (resolve, reject) => {
    progressLog(fileId, "slicing the file ");
    const totleSize = fs.statSync(sourFilePath).size;
    let blockSize = 102400;
    if (totleSize > 209715200) {
      blockSize = 2097152;
    }
    const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, blockSize); // max length 2MB  = 2097152  kb
    log(buffInfoArray);
    let i = 0;
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
    let progressBar;
    if (showProgressBar) {
      progressBar = new ProgressBar(
        "uploading [:bar] :rate/bps :percent last: :etas",
        {
          width: 50,
          total: totleSize,
        }
      );
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
            fileId: fileId,
            fileHash: fileHash,
            backups: "1",
            blockTotal: buffInfoArray.length,
            blockSize: buf.length,
            blockIndex: i,
            data: buf,
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
  walletAddress,
  newFilePath,
  fileId,
  fileHash,
  wsUrls,
  showProgressBar,
  log,
  progressLog
) {
  return new Promise(async (resolve, reject) => {
    let isFinish = false;
    let bufs = [];
    let blockTotal = 1;
    let blockIndex = 1;

    for (wsUrl of wsUrls) {
      try {
        progressLog(fileId, "try connect to " + wsUrl);
        log("try connect to ", wsUrl);
        await wsproto.init(wsUrl, protoFilePath, "ReqMsgDownload", "RespMsg");
        if (wsproto.ws.wsIsOpen) {
          break;
        }
      } catch (e) {
        log(e);
      }
    }

    let i = 0;
    progressLog(fileId, "downloading.... from " + wsUrl);
    log("downloading....");
    while (!isFinish) {
      try {
        i++;
        var payload = {
          version: 1,
          id: 2,
          method: "readfile",
          service: "wservice",
          body: {
            walletAddress: walletAddress,
            fileId: fileId,
            fileHash: fileHash,
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
          blockIndex = json.body.data.blockIndex;
          blockTotal = json.body.data.blockTotal;
          let per = parseInt((blockIndex * 100) / blockTotal);
          progressLog(fileId, "downloading.... ", null, per);
          // log("blockIndex:", blockIndex, "blockTotal:", blockTotal);
          if (showProgressBar) {
            if (i === 1) {
              log("total blockTotal:", blockTotal);
              progressBar = new ProgressBar(
                "downloading [:bar] :percent :current/:total",
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
        return reject(e);
      }
    }
    progressLog(fileId, "download finish and joining file with blocks.");
    log("download finish");
    await fileSlice.joinBlcoksToFile(newFilePath, bufs);
    log("complete");
    progressLog(fileId, "join file complete.");
    resolve();
  });
}
