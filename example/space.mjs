if (typeof global != "undefined") {
  global.window = { isNode: true };
} else {
  window.global = { isNode: false };
}

console.log(window);

import { Space, InitAPI, Common} from "../index.mjs";
const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const mnemonic =
  "";
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
    return;

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
