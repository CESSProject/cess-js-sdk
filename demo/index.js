const fs = require("fs");
const ws = require("./ws-helper");
const proto = require("./proto-helper");
const fileSlice = require("fs-slicer");
const wsUrl = "ws://139.196.35.64:15001";

// function upload() {
//   protobuf.load("proto_person.proto", function (err, root) {
//     if (err) throw err;

//     var AwesomeMessage = root.lookupType("ReqMsgUpload");
//     let fileBuff = fs.readFileSync("package.json");
//     var payload = {
//       version: 1,
//       id: 2,
//       method: "writefile",
//       service: "wservice",
//       body: {
//         fileId: "hSidH7r4xvHSkQcs5Zv68U",
//         fileHash: "5DiG338NH422432N2RUE2322425DiG338NH422432N2RUJ2",
//         backups: "1",
//         blocks: 1,
//         blockSize: fileBuff.length,
//         blockNum: 1,
//         data: fileBuff
//       }
//     };
//     var errMsg = AwesomeMessage.verify(payload);
//     if (errMsg) throw Error(errMsg);
//     var message = AwesomeMessage.create(payload);
//     var buffer = AwesomeMessage.encode(message).finish();
//     let sour = AwesomeMessage.decode(buffer);
//     console.log(sour);

//     async function main() {
//       let ws = await createWs(onMessage);
//       ws.send(buffer);
//     }

//     var AwesomeMessage = root.lookupType("RespMsg");
//     function onMessage(data) {
//       console.log("res:");
//       console.log(data);
//       sour = AwesomeMessage.decode(data);
//       console.log(sour);
//     }
//     function createWs(onmessage) {
//       return new Promise((resole, reject) => {
//         const ws = new WebSocket("ws://139.196.35.64:15001");
//         ws.on("open", function open() {
//           console.log("open");
//           resole(ws);
//         });

//         ws.on("close", function close(e) {
//           console.log("disconnected");
//           if (e === 1006) {
//             console.log("retry");
//             // setTimeout(main, 500);
//           }
//         });
//         ws.on("error", function close(e) {
//           console.log("error,", e);
//         });

//         ws.on("message", onmessage);
//       });
//     }

//     main();
//   });
// }
// upload();

async function uploadWithSlice() {
  const { ReqMsgUpload, RespMsg } = await proto("ws.proto", [
    "ReqMsgUpload",
    "RespMsg",
  ]);
  await ws.open(wsUrl);

  const sourFilePath = "package.json";
  const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, 100);
  console.log(buffInfoArray);
  let i = 0;
  for (const info of buffInfoArray) {
    i++;
    const buf = await fileSlice.readOneBlock(sourFilePath, info);
    const payload = {
      version: 1,
      id: 2,
      method: "writefile",
      service: "wservice",
      body: {
        fileId: "seioZ5Gbn7ExVmfJViDjyo",
        fileHash: "5DiG338NH422432N2RUE232242532DiG338NH422432N2RUJ2",
        backups: "1",
        blocks: buffInfoArray.length,
        blockSize: buf.length,
        blockNum: i,
        data: buf,
      },
    };
    const errMsg = ReqMsgUpload.verify(payload);
    if (errMsg) throw Error(errMsg);
    console.log("发送第【", i, "】块文件.");
    const message = ReqMsgUpload.create(payload);
    const buffer = ReqMsgUpload.encode(message).finish();
    const res = await ws.send(buffer);
    const json = RespMsg.decode(res);
    console.log("第【", i, "】块文件发送完毕.");
    console.log(json);
  }
  console.log("文件全部发送完毕!");
}
// uploadWithSlice();

// function download() {
//   protobuf.load("proto_person.proto", function (err, root) {
//     if (err) throw err;

//     var AwesomeMessage = root.lookupType("properson.ReqMsgDownload");
//     var payload = {
//       version: 1,
//       id: 2,
//       method: "readfile",
//       service: "wservice",
//       body: {
//         fileId: "hSidH7r4xvHSkQcs5Zv68U",
//         walletAddress: "5FFTWbBFNxggSstPbn2jfLs5KrxgxehuntFrE6JH9KpvnMjx",
//         blocks: 1
//       }
//     };
//     var errMsg = AwesomeMessage.verify(payload);
//     if (errMsg) throw Error(errMsg);
//     var message = AwesomeMessage.create(payload);
//     var buffer = AwesomeMessage.encode(message).finish();
//     let sour = AwesomeMessage.decode(buffer);
//     console.log(sour);
//     async function main() {
//       let ws = await createWs(onMessage);
//       ws.send(buffer);
//     }

//     var AwesomeMessage = root.lookupType("properson.RespMsg");
//     function onMessage(data) {
//       console.log("res:");
//       console.log(data);
//       sour = AwesomeMessage.decode(data);
//       console.log(sour);
//       fs.writeFileSync('b.txt',sour.body.data.data);
//     }
//     function createWs(onmessage) {
//       return new Promise((resole, reject) => {
//         const ws = new WebSocket("ws://139.196.35.64:15001");
//         ws.on("open", function open() {
//           console.log("open");
//           resole(ws);
//           //   const array = new Float32Array(5);

//           //   for (var i = 0; i < array.length; ++i) {
//           //     array[i] = i / 2;
//           //   }
//           //   var buf = new Uint8Array(reader.result);

//           //   ws.send(array);
//           //   try {
//           //     ws.send(Date.now());
//           //   } catch (e) {
//           //     console.log(e);
//           //   }
//         });

//         ws.on("close", function close(e) {
//           console.log("disconnected");
//           if (e === 1006) {
//             console.log("retry");
//             // setTimeout(main, 500);
//           }
//         });
//         ws.on("error", function close(e) {
//           console.log("error,", e);
//         });

//         ws.on("message", onmessage);
//       });
//     }

//     main();
//   });
// }
// download();

async function downloadWithSlice() {
  const { ReqMsgDownload, RespMsg } = await proto("ws.proto", [
    "ReqMsgDownload",
    "RespMsg",
  ]);
  await ws.open(wsUrl);
  var payload = {
    version: 1,
    id: 2,
    method: "readfile",
    service: "wservice",
    body: {
      fileId: "seioZ5Gbn7ExVmfJViDjyo",
      walletAddress: "5FFTWbBFNxggSstPbn2jfLs5KrxgxehuntFrE6JH9KpvnMjx",
      blocks: 1,
    },
  };
  var errMsg = ReqMsgDownload.verify(payload);
  if (errMsg) throw Error(errMsg);
  var message = ReqMsgDownload.create(payload);
  var buffer = ReqMsgDownload.encode(message).finish();
  const res = await ws.send(buffer);
  const json = RespMsg.decode(res);
  console.log("文件接收完毕.");  
  if (json.body.msg && json.body.msg == "success" && json.body.data.data) {
    fs.writeFileSync("b.txt", json.body.data.data);
  }else{
    console.log(json);
  }
}
downloadWithSlice().then(() => {});
