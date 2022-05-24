const { FileStorage, Keyring } = require("../");
const config = require("./config");
const fs = require("fs");
const path = require("path");
const md5File = require("md5-file");
const short = require("short-uuid");
const { getFileInfo, upload, download } = require("../src/file-process");

const mnemonic =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
const walletAddress = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
let fileId = "1My52sjDJbR3yTtRoXfPQZ";

const api = new FileStorage(config);
const keyring = new Keyring(config);

// findPrice();
// findPurchasedSpace();
// expansion();

// findFile();
// findFileList();

// fileUpload();
fileDownload();
// fileDelete();
// fileEncrypt();
// fileDecrypt();

// fileUploadWithTxHash().then(console.log,console.log);
// fileDeleteWithTxHash().then(console.log,console.log);
// expansionWithTxHash().then(console.log,console.log);


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
    .fileUpload(mnemonic, filePath, backups, downloadfee, null)
    .then(console.log, console.error);
}
function fileDownload() {
  const fileSaveDir = "./file/down/";
  const privatekey = "123456";
  //mnemonic, fileId, fileSaveDir, privatekey
  api.fileDownload(fileId, fileSaveDir, null).then(console.log, (e) => {
    console.error(e);
    if (e == "The file has not been backed up") {
      setTimeout(fileDownload, 3000);
      console.log("Will retry after 3s.");
    }
  });
}
function expansion() {
  let spaceCount = 1;
  let leaseCount = 1;
  let maxPrice = 0;
  api
    .expansion(mnemonic, spaceCount, leaseCount, maxPrice)
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
async function getFileUploadTxHash() {
  const filePath = "./file/a.zip";
  const privatekey = "123456";
  const backups = 1;
  const downloadfee = 0;
  return api.getFileUploadTxHash(mnemonic, filePath, backups, downloadfee, privatekey);
}
async function fileUploadWithTxHash() {
  const { txHash, filePath, fileid, privatekey } = await getFileUploadTxHash();
  // return;
  api
    .fileUploadWithTxHash(txHash, filePath, fileid, privatekey)
    .then(console.log, console.error);
}
async function getFileDeleteTxHash() {
  try {
    return api.getFileDeleteTxHash(mnemonic, fileId);
  } catch (error) {
    console.error(error);
  }
}
async function fileDeleteWithTxHash() {
  try {
    const txHash =await getFileDeleteTxHash();
    const hash = await api.fileDeleteWithTxHash(txHash);
    console.log(hash);
  } catch (error) {
    console.error(error);
  }
}
async function getExpansionTxHash() {
  const spaceCount = 1;
  const leaseCount = 1;
  const maxPrice = 0;
  return api.getExpansionTxHash(mnemonic, spaceCount, leaseCount, maxPrice);
}
async function expansionWithTxHash() {
  try {
    const txHash = await getExpansionTxHash();
    const hash = await api.expansionWithTxHash(txHash);
    console.log(hash);
  } catch (error) {
    console.error(error);
  }
}
