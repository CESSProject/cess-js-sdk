/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */
const { join: joinPath, resolve: resolvePath } = require("node:path");

const { File, InitAPI, testnetConfig } = require("../../");
const { wellKnownAcct } = require("../config");
const { getDataIfOk } = require("../util");

const LICENSE_PATH = resolvePath(joinPath(__dirname, "../../LICENSE"));
const BUCKET_NAME = "test";

async function queryFileList(oss, accountId32) {
  console.log("queryFileList:");
  let result = await oss.queryFileListFull(accountId32);
  console.log(getDataIfOk(result), "\n");
  return result;
}

async function queryFileMetadata(oss, fileHash) {
  console.log("queryFileMetadata:");
  const result = await oss.queryFileMetadata(fileHash);
  console.log(getDataIfOk(result), "\n");
}

async function uploadFile(oss, accountId32, mnemonic, bucketName) {
  console.log("uploadFile:");
  const result = await oss.uploadFile(mnemonic, accountId32, LICENSE_PATH, bucketName);
  console.log(getDataIfOk(result), "\n");
  return result;
}

async function downloadFile(oss, fileHash) {
  console.log("downloadFile:");
  const result = await oss.downloadFile(fileHash, "./tmp.txt");
  console.log(result.msg === "ok" ? result.data : result);
}

async function deleteFile(oss, accountId32, mnemonic, fileHash) {
  console.log("deleteFile:");
  const result = await oss.deleteFile(mnemonic, accountId32, [fileHash]);
  console.log(result.msg === "ok" ? result.data : result);
}

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);
  const { mnemonic, addr } = wellKnownAcct;
  const oss = new File(api, keyring, testnetConfig.gatewayURL, true);

  let tmpFileHash="0414617e35db30b114360d6ade6f6a980784c5c6052f6d8a8cae90b342d9ccb6";
  await downloadFile(oss, tmpFileHash);

  // let result = await queryFileList(oss, addr);
  // if (result.msg != "ok") {
  //   return;
  // }
  // let bucketName = BUCKET_NAME;
  // if (result.data?.length) {
  //   let tmpFileHash = result.data[0].fileHash;
  //   await queryFileMetadata(oss, tmpFileHash);
  //   bucketName = result.data[0].bucketName;
  //   await downloadFile(oss, tmpFileHash);
  //   await deleteFile(oss, addr, mnemonic, tmpFileHash);
  // }
  // await uploadFile(oss, addr, mnemonic, bucketName);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
