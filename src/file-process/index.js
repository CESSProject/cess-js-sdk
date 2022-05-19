const WsProto = require("websocket-grpc");
const fileSlice = require("fs-slicer");
const md5File = require("md5-file");
const path = require("path");
const fs = require("fs");
const ProgressBar = require("color-progress-bar");
const wsproto = new WsProto();

module.exports = { upload, download, getFileInfo };

function getFileInfo(filePath) {
  return {
    filehash: md5File.sync(filePath),
    filename: path.basename(filePath),
    filesize: fs.statSync(filePath).size,
  };
}

function upload(sourFilePath, fileId, fileHash, wsUrl, showProgressBar,log) {
  return new Promise(async (resolve, reject) => {
    const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, 2097152); // max length 2MB  = 2097152
    const totleSize = buffInfoArray[buffInfoArray.length - 1].end;
    log(buffInfoArray);
    let i = 0;
    await wsproto.init(
      wsUrl,
      "./src/file-process/ws.proto",
      "ReqMsgUpload",
      "RespMsg"
    );
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
            blocks: i,
            blockSize: buf.length,
            blockNum: buffInfoArray.length,
            data: buf,
          },
        };
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
    // log("upload complete!");
    resolve(fileId);
  });
}

function download(
  walletAddress,
  newFilePath,
  fileId,
  fileHash,
  wsUrl,
  showProgressBar,
  log
) {
  return new Promise(async (resolve, reject) => {
    let isFinish = false;
    let bufs = [];
    let blocks = 1;
    let blockNum = 1;
    await wsproto.init(
      wsUrl,
      "./src/file-process/ws.proto",
      "ReqMsgDownload",
      "RespMsg"
    );
    let i = 0;
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
            blocks,
          },
        };
        let json = await wsproto.request(payload);
        // log(json);
        if (
          json.body.msg &&
          json.body.msg == "success" &&
          json.body.data.data
        ) {
          // fs.writeFileSync("b.txt", json.body.data.data);
          // log("index=" + blocks, "size=" + json.body.data.data.length);
          bufs.push(json.body.data.data);
          blockNum = json.body.data.blockNum;
          blocks = json.body.data.blocks;
          // log("blockNum:", blockNum, "blocks:", blocks);
          if (showProgressBar) {
            if (i === 1) {
              log("total blocks:", blockNum);
              progressBar = new ProgressBar(
                "downloading [:bar] :percent :current/:total",
                {
                  width: 50,
                  total: blockNum
                }
              );
              progressBar.tick();
            }else{
              progressBar.tick();
            }
          }
          if (blocks < blockNum) {
            blocks++;
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
    await fileSlice.joinBlcoksToFile(newFilePath, bufs);
    log("complete");
    resolve();
  });
}
