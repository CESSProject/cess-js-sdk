const { Bucket, InitAPI } = require("../");

const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const mnemonic =
  "";
let result = "";

const oss = new Bucket(api, keyring, true);

async function main() {
  try {
    console.log("==============queryBucketList=======================");
    result = await oss.queryBucketList3(accountId32);
    console.log(result.data);
    if (result.msg != "ok") {
      return console.log(result);
    }
    return ;

    if (result.data == null || result.data.length == 0) {
      console.log("==============createBucket=======================");
      result = await oss.createBucket(mnemonic, accountId32, "fage");
      console.log(result);
    } else {
      console.log("==============queryBucketInfo=======================");
      let name = result.data[0];
      result = await oss.queryBucketInfo(accountId32);
      console.log(result);
      return ;

      result = await oss.deleteBucket(mnemonic,accountId32, name);
      console.log(result);
    }

    console.log("==============queryBucketList=======================");
    result = await oss.queryBucketList(accountId32);
    console.log(result);

    process.exit();
  } catch (e) {
    console.log(e);
  }
}

main();
