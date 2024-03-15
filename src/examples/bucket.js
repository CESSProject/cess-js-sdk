/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */
const { Authorize, Bucket, InitAPI, testnetConfig, wellKnownAcct } = require("../../");
const { getDataIfOk } = require("../util");

const bucketName = "test";
const { mnemonicOrAccountId32: mnemonic, addr } = wellKnownAcct;
const { gateway } = testnetConfig;

async function setupTeardown(api, keyring, func) {
  const authService = new Authorize(api, keyring);

  // Authorize the user account for DeOSS
  process.stdout.write("Running authorize()...");
  let result = await authService.authorize(mnemonic, gateway.addr);
  console.log(getDataIfOk(result));

  await func.call();

  process.stdout.write("Running cancelAuthorize()...");
  result = await authService.cancelAuthorize(mnemonic, gateway.addr);
  console.log(getDataIfOk(result));
}

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);

  await setupTeardown(api, keyring, async () => {
    const bucketService = new Bucket(api, keyring);

    let result = await bucketService.queryBucketList(addr);
    console.log("current bucket list:", getDataIfOk(result));

    // If result.msg is not "ok", something is wrong with the remote connection, so we exit.
    if (result.msg !== "ok") {
      console.error(result);
      return;
    }

    process.stdout.write("Running createBucket()...");
    try {
      result = await bucketService.createBucket(mnemonic, addr, bucketName);
      console.log(getDataIfOk(result));
    } catch (err) {
      console.error("error:", err);
    }

    result = await bucketService.queryBucketInfo(addr, bucketName);
    console.log(`query bucketInfo ${bucketName}:`, getDataIfOk(result));

    result = await bucketService.queryBucketList(addr);
    console.log("current bucket list:", getDataIfOk(result));

    process.stdout.write("Running deleteBucket()...");
    try {
      result = await bucketService.deleteBucket(mnemonic, addr, bucketName);
      console.log(getDataIfOk(result));
    } catch (err) {
      console.error("error:", err);
    }

    result = await bucketService.queryBucketList(addr);
    console.log("current bucket list:", getDataIfOk(result));
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
