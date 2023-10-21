/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 *
 */
const { File, InitAPI } = require("../index.js");

const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const mnemonic = "";
let result = "";

const oss = new File(api, keyring, true);

async function queryFileList() {
  try {
    console.log("==============queryFileList=======================");
    result = await oss.queryFileListFull(accountId32);
    console.log(result.data);
    if (result.msg != "ok") {
      return console.log(result);
    }
    process.exit();
  } catch (e) {
    console.log(e);
  }
}
async function uploadFile() {
  try {
    console.log("==============uploadFile=======================");
    let filePath = "./file/sour/a.txt";
    let bucketName = "fage";
    result = await oss.uploadFile(mnemonic, accountId32, filePath, bucketName);
    console.log(result.data);
    if (result.msg != "ok") {
      return console.log(result);
    }
    process.exit();
  } catch (e) {
    console.log(e);
  }
}
async function downloadFile() {
  try {
    console.log("==============downloadFile=======================");
    let fileHash = "2079b3ca8d5261c012cca20e955f0d0a8afe1cca9bb3c023a9527504477802dc";
    result = await oss.downloadFile(fileHash, "./file/down/a.txt");
    console.log(result.data);
    if (result.msg != "ok") {
      return console.log(result);
    }
    process.exit();
  } catch (e) {
    console.log(e);
  }
}
async function queryFileMetadata() {
  try {
    console.log("==============queryFileMetadata=======================");
    let fileHash = "d8dbf99e9ed4fed5db4f5cb945410177d47bcdab9d99e04f33c116655f8c7656";
    result = await oss.queryFileMetadata(fileHash);
    console.log(result.data);
    if (result.msg != "ok") {
      return console.log(result);
    }
    process.exit();
  } catch (e) {
    console.log(e);
  }
}
async function deleteFile() {
  try {
    console.log("==============deleteFile=======================");
    let fileHash = "d8dbf99e9ed4fed5db4f5cb945410177d47bcdab9d99e04f33c116655f8c7656";
    result = await oss.deleteFile(mnemonic, accountId32, [fileHash]);
    console.log(result.data);
    if (result.msg != "ok") {
      return console.log(result);
    }
    process.exit();
  } catch (e) {
    console.log(e);
  }
}
queryFileList();
uploadFile();
downloadFile();
queryFileMetadata();
deleteFile();
