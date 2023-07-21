const { File, InitAPI, Common } = require("../index.cjs");

const config = require("../src/config");
const util = require("../src/util/index");
const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const accountId32_2 = "cXgdDQ65sFMX7hB9EbF42nys6XxSFLMTeQK2RoQkoopn26kXZ";
const mnemonic =
  "";
let result = "";

const oss = new File(api, keyring, true);
const common = new Common(api, keyring, true);

async function queryFileList() {
  try {
    console.log("==============queryFileList=======================");
    result = await oss.queryFileList(accountId32);
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
    let fileHash =
      "518d28bf84caf9254f57f938d3814e7e18578cab9197b2bf5e071c38fe977f60";
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
    let fileHash =
      "d8dbf99e9ed4fed5db4f5cb945410177d47bcdab9d99e04f33c116655f8c7656";
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
    let fileHash =
      "d8dbf99e9ed4fed5db4f5cb945410177d47bcdab9d99e04f33c116655f8c7656";
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
// uploadFile();
// downloadFile();
// queryFileMetadata();
// deleteFile();
