const WsProto = require("./ws-proto");
const fileSlice = require("fs-slicer");
const md5File = require("md5-file");
const path = require("path");
const fs = require("fs");
const wsproto = new WsProto();

module.exports = { upload, download ,getFileInfo};

function getFileInfo(filePath){
  return {
      filehash:md5File.sync(filePath),
      filename:path.basename(filePath),
      filesize:fs.statSync(filePath).size
  }
}

async function upload(sourFilePath, fileId, fileHash, wsUrl) {
  const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, 2097152);
  console.log(buffInfoArray);
  let i = 0;
  await wsproto.init(
    wsUrl,
    "./src/file-process/ws.proto",
    "ReqMsgUpload",
    "RespMsg"
  );
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
      console.log("发送第【", i, "/", buffInfoArray.length, "】块文件.");
      let res = await wsproto.request(payload);
      console.log(res);
      console.log("第【", i, "】块文件发送完毕.");
    } catch (err) {
      console.log(err);
    }
  }
  console.log("文件全部发送完毕!");
}
// function testUpload() {
//   const sourFilePath = "./file/a.zip";
//   const wsUrl = "ws://139.196.35.64:15001";
//   const fileId = "1Q6uZ5FWf3JvXWkZn5mgDb";
//   const fileHash = "4805327c2d990da3b3896c9572d3739d";
//   upload(sourFilePath, fileId, fileHash, wsUrl).then(console.log, console.log);
// }
// testUpload();

async function download(newFilePath, fileId, fileHash, wsUrl) {
  let hasFile = true;
  let bufs = [];
  let blocks = 1;
  let blockNum = 1;
  await wsproto.init(
    wsUrl,
    "./src/file-process/ws.proto",
    "ReqMsgDownload",
    "RespMsg"
  );
  while (hasFile) {
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
    console.log(json);
    if (json.body.msg && json.body.msg == "success" && json.body.data.data) {
      // fs.writeFileSync("b.txt", json.body.data.data);
      console.log("index=" + blocks, "size=" + json.body.data.data.length);
      bufs.push(json.body.data.data);
      blockNum = json.body.data.blockNum;
      blocks = json.body.data.blocks;
      if (blocks < blockNum) {
        blocks++;
        hasFile = true;
      } else {
        hasFile = false;
      }
    } else {
      console.log(json);
      hasFile = false;
    }
  }
  console.log("文件全部下载完毕,开始拼接文件");
  await fileSlice.joinBlcoksToFile(newFilePath, bufs);
  console.log("完毕");
}
// function testDownload() {
//   const newFilePath = "./file/b.zip";
//   const wsUrl = "ws://139.196.35.64:15001";
//   const fileId = "1Q6uZ5FWf3JvXWkZn5mgDb";
//   const fileHash = "4805327c2d990da3b3896c9572d3739d";
//   download(newFilePath, fileId, fileHash, wsUrl).then(console.log, console.log);
// }
