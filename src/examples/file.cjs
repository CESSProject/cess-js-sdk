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
}

async function uploadFile(oss, accountId32, mnemonic) {
  console.log("uploadFile:");
  const result = await oss.uploadFile(mnemonic, accountId32, LICENSE_PATH, BUCKET_NAME);
  console.log(getDataIfOk(result), "\n");
}

async function downloadFile(oss) {
  console.log("downloadFile:");
  oss;
  // const fileHash = "2079b3ca8d5261c012cca20e955f0d0a8afe1cca9bb3c023a9527504477802dc";
  // const result = await oss.downloadFile(fileHash, "./file/down/a.txt");
  // console.log(result.msg === "ok" ? result.data : result);
}

async function queryFileMetadata(oss) {
  console.log("queryFileMetadata:");
  oss;
  // const fileHash = "d8dbf99e9ed4fed5db4f5cb945410177d47bcdab9d99e04f33c116655f8c7656";
  // const result = await oss.queryFileMetadata(fileHash);
  // console.log(result.msg === "ok" ? result.data : result);
}

async function deleteFile(oss, accountId32, mnemonic) {
  console.log("deleteFile:");
  oss;
  accountId32;
  mnemonic;
  // const fileHash = "d8dbf99e9ed4fed5db4f5cb945410177d47bcdab9d99e04f33c116655f8c7656";
  // const result = await oss.deleteFile(mnemonic, accountId32, [fileHash]);
  // console.log(result.msg === "ok" ? result.data : result);
}

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);
  const { mnemonic, addr } = wellKnownAcct;
  const oss = new File(api, keyring, testnetConfig.gatewayURL, true);

  await queryFileList(oss, addr);
  await uploadFile(oss, addr, mnemonic);
  await downloadFile(oss);
  await queryFileMetadata(oss);
  await deleteFile(oss, addr, mnemonic);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
