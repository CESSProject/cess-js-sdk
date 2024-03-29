/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */

import { Space, InitAPI, Common } from "../index.mjs";
import { testnetConfig, wellKnownAcct } from "../config.js";
import { getDataIfOk } from "../util/index.js";

if (typeof global !== "undefined") {
  global.window = { isNode: true };
} else {
  window.global = { isNode: false };
}

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);
  const { addr, mnemonic } = wellKnownAcct;

  const space = new Space(api, keyring);
  const common = new Common(api, keyring);

  console.log("query userOwnedSpace:");
  let result = await space.userOwnedSpace(addr);
  const blockHeight = await common.queryBlockHeight();
  result = common.formatSpaceInfo(result.data, blockHeight);
  console.log(result);

  if (result.totalSpace) {
    console.log("expansionSpace:");
    result = await space.expansionSpace(mnemonic, 1);
    console.log(getDataIfOk(result), "\n");

    console.log("renewalSpace:");
    result = await space.renewalSpace(mnemonic, 1);
    console.log(getDataIfOk(result), "\n");
  } else {
    console.log("buySpace:");
    result = await space.buySpace(mnemonic, 1);
    console.log(getDataIfOk(result), "\n");
  }

  console.log("query userOwnedSpace:");
  result = await space.userOwnedSpace(addr);
  result = common.formatSpaceInfo(result.data, blockHeight);
  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
