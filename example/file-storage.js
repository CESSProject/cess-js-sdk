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
let fileId =
  "cess4dd2bb46d61790b4947914ce9c809cd16a4fadca03c72b12a5efa018fff4281c"; //"o1yBUPi7MzTX9VCa6xUfTY"; // a.zip=7tG48E9Mx58R911GCjir9v  a.exe=hmPZnyLA4D9UNc4Yz1rTWD  ghvsqdCiCpWAtwGe5zC8Rm a.txt=9LiiknJ5qXHpCXa4QkV6UU

const api = new FileStorage(config);
const keyring = new Keyring(config);

// console.log(api.api._rx.rpc.chain)

// findPrice();
// findPurchasedSpace();
// expansion();

// findFile();
// findFileList();



fileUpload().then(console.log,console.log);
// fileDownload();



// fileDelete();
// fileEncrypt();
// fileDecrypt();

//
// fileDeleteWithTxHash().then(console.log,console.log);
// expansionWithTxHash().then(console.log,console.log);

// getFileUploadTxHash().then(console.log,console.log);

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
function fileDownload() {
  const fileSaveDir = "./file/down/";
  //mnemonic, fileId, fileSaveDir, privatekey
  let lastMsg = "";
  let timeout = setInterval(() => {
    let msg = global[fileId];
    if (lastMsg != msg && msg.msg != "downloading.... ") {
      lastMsg = msg;
      console.log(msg);
    }
  }, 100);
  api.fileDownload(fileId, fileSaveDir).then(
    (t) => {
      console.log(t);
      clearInterval(timeout);
    },
    (e) => {
      clearInterval(timeout);
      console.error(e);
      if (e == "The file has not been backed up") {
        setTimeout(fileDownload, 3000);
        console.log("Will retry after 3s.");
      }
    }
  );
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
  let filePath = "./file/a.exe.crypt",
    newFilePath = "./file/a2.exe",
    privatekey = "123456";
  api
    .fileDecrypt(filePath, newFilePath, privatekey)
    .then((t) => console.log("decrypt sucess!"), console.error);
}
async function getFileUploadTxHash() {
  const filePath = "./file/a.txt";
  return api.getFileUploadTxHash(mnemonic, filePath);
}
async function fileUpload() {
  const { txHash, filePath, fileId, publicKeyStr, signStr } = await getFileUploadTxHash();
  return api.fileUploadWithTxHash(txHash, filePath, fileId, publicKeyStr, signStr);
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
    const txHash = await getFileDeleteTxHash();
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
