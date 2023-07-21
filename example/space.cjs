const { Space, InitAPI, Common } = require("../");
const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const accountId32_2 = "cXgdDQ65sFMX7hB9EbF42nys6XxSFLMTeQK2RoQkoopn26kXZ";
const mnemonic =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
let result = "";

console.log('mjs');

const space = new Space(api, keyring, true);
const common = new Common(api, keyring, true);
async function testSpace() {
  try {
    console.log("==============query userOwnedSpace=======================");
    result = await space.userOwnedSpace(accountId32);
    // console.log(result);
    const blockHeight = await common.queryBlockHeight();
    await common.formatSpaceInfo(result.data, blockHeight);
    console.log(result);
    // return;

    if (result.data?.totalSpace) {
      console.log("==============expansionSpace=======================");
      result = await space.expansionSpace(mnemonic, 1);
      console.log(result);

      console.log("==============renewalSpace=======================");
      result = await space.renewalSpace(mnemonic, 5);
      console.log(result);
    } else {
      console.log("==============buySpace=======================");
      result = await space.buySpace(mnemonic, 1);
      console.log(result);
    }

    console.log("==============query userOwnedSpace=======================");
    result = await space.userOwnedSpace(accountId32);
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

testSpace();
