const { FileStorage, Keyring } = require("../");
const config = require("./config");

const accountId =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
const addr = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
let fileId = "uT9cyumWeVKuhEuqe5u2vi";

const api = new FileStorage(config);

// findPrice();
// findPurchasedSpace();
// findFile();
// findFileList();
// fileUpload();
fileDownload();
// expansion();
// fileDelete();
// fileEncrypt();
// fileDecrypt();

function findPrice() {
  api.findPrice().then(console.log, console.log);
}
function findPurchasedSpace() {
  api.findPurchasedSpace(addr).then(console.log, console.log);
}
function findFile() {
  api.findFile(fileId).then(console.log, console.log);
}
function findFileList() {
  api.findFileList(addr).then(console.log, console.log);
}
function fileUpload() {
  const filePath = "./file/a.zip";
  let ispublic = true,
    privatekey = "123456",
    backups = 1,
    downloadfee = 0;
  api
    .fileUpload(accountId, filePath, privatekey, backups, downloadfee)
    .then(console.log, console.log);
  // https://cess.yuque.com/zw1p48/project/nyceow#a89bc375
}
function fileDownload() {
  const fileSaveDir = "./file/down/";
  const privatekey = "123456";
  //mnemonic, fileId, fileSaveDir, privatekey
  api
    .fileDownload(accountId, fileId, fileSaveDir)
    .then(console.log, console.log);
  // https://cess.yuque.com/zw1p48/project/nyceow#a89bc375
}
function expansion() {
  let spaceCount = 1;
  let leaseCount = 1;
  let maxPrice = 0;
  api
    .expansion(accountId, spaceCount, leaseCount, maxPrice)
    .then(console.log, console.log);
}
function fileDelete() {
  api.fileDelete(accountId, fileId).then(console.log, console.log);
}
function fileEncrypt() {
  let filePath = "./package.json",
    newFilePath = "./example/package.json.cess",
    privatekey = "123456";
  api
    .fileEncrypt(filePath, newFilePath, privatekey)
    .then(t=>console.log('encrypt sucess!'), console.error);
}
function fileDecrypt() {
  let filePath = "./example/package.json.cess",
    newFilePath = "./example/package.json",
    privatekey = "123456";
  api
    .fileDecrypt(filePath, newFilePath, privatekey)
    .then(t=>console.log('decrypt sucess!'), console.error);
}
