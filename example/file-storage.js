const { FileStorage } = require("../");
const config = require("./config");

const mnemonic =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
const walletAddress = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
let fileId = "aKEHqHxtiovX6RAYG1o1Mz";

const api = new FileStorage(config);

// findPrice();
// findPurchasedSpace();
// expansion();

// findFile();
// findFileList();

// fileUpload();
// fileDownload();
// fileDelete();
// fileEncrypt();
// fileDecrypt();

function findPrice() {
  api.findPrice().then(console.log, console.log);
}
function findPurchasedSpace() {
  api.findPurchasedSpace(walletAddress).then(console.log, console.log);
}
function findFile() {
  api.findFile(fileId).then(console.log, console.log);
}
function findFileList() {
  api.findFileList(walletAddress).then(console.log, console.log);
}
function fileUpload() {
  const filePath = "./file/a.zip";
  const privatekey = "123456",
    backups = 1,
    downloadfee = 0;
  api
    .fileUpload(mnemonic, filePath, backups, downloadfee, privatekey)
    .then(console.log, console.error);
  // https://cess.yuque.com/zw1p48/project/nyceow#a89bc375
}
function fileDownload() {
  const fileSaveDir = "./file/down/";
  const privatekey = "123456";
  //mnemonic, fileId, fileSaveDir, privatekey
  api
    .fileDownload(fileId, fileSaveDir, privatekey)
    .then(console.log, e=>{
      console.error(e);
      if(e=='The file has not been backed up'){
        setTimeout(fileDownload,3000);
        console.log('Will retry after 3s.')
      }
    });
  // https://cess.yuque.com/zw1p48/project/nyceow#a89bc375
}
function expansion() {
  let spaceCount = 1;
  let leaseCount = 1;
  let maxPrice = 0;
  api
    .buySpace(mnemonic, spaceCount, leaseCount, maxPrice)
    .then(console.log, console.log);
}
function fileDelete() {
  api.fileDelete(mnemonic, fileId).then(console.log, console.log);
}
function fileEncrypt() {
  let filePath = "./package.json",
    newFilePath = "./example/package.json.cess",
    privatekey = "123456";
  api
    .fileEncrypt(filePath, newFilePath, privatekey)
    .then((t) => console.log("encrypt sucess!"), console.error);
}
function fileDecrypt() {
  let filePath = "./example/package.json.cess",
    newFilePath = "./example/package.json",
    privatekey = "123456";
  api
    .fileDecrypt(filePath, newFilePath, privatekey)
    .then((t) => console.log("decrypt sucess!"), console.error);
}
