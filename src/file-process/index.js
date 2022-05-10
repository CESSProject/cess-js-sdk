const WsProto = require('websocket-grpc');
const fileSlice = require("fs-slicer");
const md5File = require("md5-file");
const path = require("path");
const fs = require("fs");
const ProgressBar = require('color-progress-bar');
const wsproto = new WsProto();

module.exports = { upload, download, getFileInfo };

function getFileInfo(filePath) {
  return {
    filehash: md5File.sync(filePath),
    filename: path.basename(filePath),
    filesize: fs.statSync(filePath).size,
  };
}

function upload(sourFilePath, fileId, fileHash, wsUrl, showProgressBar) {
  return new Promise(async (resolve, reject) => {
    const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, 2097152); // max length 2MB  = 2097152
    const totleSize = buffInfoArray[buffInfoArray.length - 1].end;
    console.log(buffInfoArray);
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
        "uploading [:bar] :rate/bps :percent last: :etas",{
          width: 50,
          total: totleSize
        }
      );
    }
    for (const info of buffInfoArray) {
      try {
        i++;
        const buf = await fileSlice.readOneBlock(sourFilePath, info);
        // console.log(buf.length);continue;
        const payload = {
          version: 1,
          id: 2,
          method: "writefile",
          service: "wservice",
          body: {
            fileId: fileId,
            fileHash: fileHash,
            backups: "1",
            blocks: buffInfoArray.length,
            blockSize: buf.length,
            blockNum: i,
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
        // console.log(res);        
      } catch (err) {
        console.error(err);
        return reject(err);
      }
    }
    console.log("upload complete!");
    resolve();
  });
}

function download(newFilePath, fileId, fileHash, wsUrl) {
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
    while (!isFinish) {
      try {
        var payload = {
          version: 1,
          id: 2,
          method: "readfile",
          service: "wservice",
          body: {
            fileId: fileId,
            fileHash: fileHash,
            blocks,
          },
        };
        let json = await wsproto.request(payload);
        // console.log(json);
        if (
          json.body.msg &&
          json.body.msg == "success" &&
          json.body.data.data
        ) {
          // fs.writeFileSync("b.txt", json.body.data.data);
          // console.log("index=" + blocks, "size=" + json.body.data.data.length);
          bufs.push(json.body.data.data);
          blockNum = json.body.data.blockNum;
          blocks = json.body.data.blocks;
          if (blocks < blockNum) {
            blocks++;
            isFinish = false;
          } else {
            isFinish = true;
          }
        } else {
          console.log(json);
          isFinish = true;
        }
      } catch (e) {
        console.error(e);
        return reject(e);
      }
    }
    await fileSlice.joinBlcoksToFile(newFilePath, bufs);
    console.error("complete");
    resolve();
  });
}
