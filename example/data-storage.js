const { DataStorage } = require("..");
const config = require("./config");
const mnemonic =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
const keywords = ["test file"];
let fileId = "getFileDeleteTxHash";
const filePath = "./file/a.txt";

const api = new DataStorage(config);

// getStoreTxHash().then(console.log, console.error);;
// getRetrieveTxHash().then(console.log, console.error);
// getReplaceTxHash().then(console.log, console.error);;
getDeleteTxHash().then(console.log, console.error);

async function getStoreTxHash() {
  const { txHash, fileid } = await api.getStoreTxHash(
    mnemonic,
    filePath,
    null,
    keywords
  );
  const hash = await api.submitTransaction(txHash);
  return {
    fileid,
    hash,
  };
}
async function getRetrieveTxHash() {
  const { txHash } = await api.getRetrieveTxHash(mnemonic, fileId);
  console.log('txHash',txHash);
  const hash = await api.submitTransaction(txHash);
  return {
    fileId,
    hash,
  };
}
async function getReplaceTxHash() {
  const { txHash, newFileid } = await api.getReplaceTxHash(
    mnemonic,
    filePath,
    fileId,
    null,
    keywords
  );
  const hash = await api.submitTransaction(txHash);
  return {
    fileId,
    newFileid,
    hash,
  };
}
async function getDeleteTxHash() {
  const { txHash } = await api.getDeleteTxHash(mnemonic, fileId);
  const hash = await api.submitTransaction(txHash);
  return {
    fileId,
    hash,
  };
}
