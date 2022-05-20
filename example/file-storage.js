const { FileStorage,Keyring } = require("../");
const config = require("./config");
const fs = require("fs");
const path = require("path");
const md5File = require("md5-file");
const short = require("short-uuid");
const { getFileInfo, upload, download } = require("../src/file-process");

const mnemonic =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
const walletAddress = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
let fileId = "mQQweYap1hD82CpnKYivht";

const api = new FileStorage(config);
const keyring = new Keyring(config);

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

// fileUploadWithTxHash().then(console.log,console.log);
// fileDeleteWithTxHash().then(console.log,console.log);
expansionWithTxHash().then(console.log,console.log);

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
}
function fileDownload() {
  const fileSaveDir = "./file/down/";
  const privatekey = "123456";
  //mnemonic, fileId, fileSaveDir, privatekey
  api.fileDownload(fileId, fileSaveDir, privatekey).then(console.log, (e) => {
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

async function fileUploadWithTxHash() {
  const filePath = "./file/a.zip";
  const privatekey = "123456";
  const backups = 1;
  const downloadfee = 0;
  const { filehash, filename, filesize } = getFileInfo(filePath);
  const ispublic = privatekey ? false : true;
  const txAPI=api.api;

  await txAPI.isReady;
  const pair = keyring.createFromUri(mnemonic);
  const fileid = short.generate();
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
  const txHash =await api.sign(mnemonic, tx);
  console.log('txHash',txHash);
  // return;
  api
    .fileUploadWithTxHash(txHash, filePath, fileid, privatekey)
    .then(console.log, console.error);
}
async function fileDeleteWithTxHash() {
  try {
    const txAPI=api.api;
    await txAPI.isReady;
    const tx = txAPI.tx.fileBank.deleteFile(fileId);    
    const txHash =await api.sign(mnemonic, tx);
    console.log('txHash',txHash);
    const hash =await api.fileDeleteWithTxHash(txHash);
    console.log(hash);
  } catch (error) {
    console.error(error);
  }
}
async function expansionWithTxHash() {
  const spaceCount = 1;
  const leaseCount = 1;
  const maxPrice = 0;
  try {
    const txAPI=api.api;
    await txAPI.isReady;
    const tx = txAPI.tx.fileBank.buySpace(
      spaceCount,
      leaseCount,
      maxPrice
    );
    const txHash =await api.sign(mnemonic, tx);
    console.log('txHash',txHash);
    const hash =await api.expansionTxHash(txHash);
    console.log(hash);
  } catch (error) {
    console.error(error);
  }
}
