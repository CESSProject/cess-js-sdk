/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */
const { join: joinPath, resolve: resolvePath } = require("node:path");

const { Authorize, Bucket, Space, Common, File, InitAPI, testnetConfig } = require("../../");
const { wellKnownAcct } = require("../config");
const { getDataIfOk } = require("../util");

const sampleUploadPath = resolvePath(joinPath(__dirname, "../../LICENSE"));
const tmpDownloadPath = resolvePath("./tmp.txt");
const bucketName = "test";

const { mnemonicOrAccountId32: mnemonic, addr } = wellKnownAcct;
const { gateway } = testnetConfig;

// Performing setup / tear down function before user is uploading/downloading file
async function setupTeardown(api, keyring, func) {
  const authService = new Authorize(api, keyring);
  const space = new Space(api, keyring);
  const common = new Common(api, keyring);
  const bucketService = new Bucket(api, keyring);

  // Authorize the user account for DeOSS
  try {
    process.stdout.write("Running authorize()...");
    let result = await authService.authorize(mnemonic, gateway.addr);
    console.log(getDataIfOk(result));

    // Ensure the user has some space, if not, we buy/expand the user storage
    result = await space.userOwnedSpace(addr);
    let blockHeight = await common.queryBlockHeight();
    result = common.formatSpaceInfo(result.data, blockHeight);
    console.log("User space info:", result);

    if (!result.totalSpace) {
      // User has no space, so the user has to use buySpace
      process.stdout.write("Running buySpace()...");
      result = await space.buySpace(mnemonic, 1);
      console.log(getDataIfOk(result));
    } else if (result.remainingSpace < 10000000) {
      process.stdout.write("Running expansionSpace()...");
      result = await space.expansionSpace(mnemonic, 1);
      console.log(getDataIfOk(result));
    }

    // create the bucket bucketName if it doesn't exists
    result = await bucketService.queryBucketList(addr);
    const bucketList = getDataIfOk(result);
    console.log("current bucket list:", bucketList);

    if (!bucketList || !bucketList.some((bucket) => bucket.key === bucketName)) {
      process.stdout.write(`Running createBucket(${bucketName})...`);
      result = await bucketService.createBucket(mnemonic, addr, bucketName);
      console.log(getDataIfOk(result));
    }
  } catch (err) {
    console.error("Setup/Teardown failed:", err);
    return;
  }

  await func.call();

  process.stdout.write("Running cancelAuthorize()...");
  let result = await authService.cancelAuthorize(mnemonic, gateway.addr);
  console.log(getDataIfOk(result));
}

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);

  await setupTeardown(api, keyring, async () => {
    const fileService = new File(api, keyring, gateway.url, true);

    // Query user file
    let result = await fileService.queryFileListFull(addr);
    console.log("user file list (before upload):", getDataIfOk(result));

    // Something wrong with the fileService, exit
    if (result.msg !== "ok") {
      console.error(result);
      return;
    }

    // Upload the sampleUploadPath
    process.stdout.write(`Uploading file ${sampleUploadPath} to bucket ${bucketName}...`);
    try {
      result = await fileService.uploadFile(mnemonic, addr, sampleUploadPath, bucketName);
      console.log(getDataIfOk(result));
    } catch (err) {
      console.error("error: ", result);
    }

    // Record the file hash
    const fileHash = result.data;

    // Query the uploaded file metadata
    console.log(`fileHash: ${fileHash}`);
    result = await fileService.queryFileMetadata(fileHash);
    const metadata = getDataIfOk(result);
    console.log("Uploaded file metadata:", metadata);

    // Download the uploaded file
    process.stdout.write(`Downloading file with hash: ${fileHash}...`);
    try {
      result = await fileService.downloadFile(fileHash, tmpDownloadPath);
      console.log(getDataIfOk(result));
    } catch (err) {
      console.error("error: ", result);
    }

    // Delete the uploaded file, only when the metadata is valid (the file is recognized on-chain)
    if (metadata) {
      process.stdout.write(`Deleting file with hash ${fileHash}...`);
      try {
        result = await fileService.deleteFile(mnemonic, addr, fileHash);
        console.log(getDataIfOk(result));
      } catch (err) {
        console.error("error: ", result);
      }
    }
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
