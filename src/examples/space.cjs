/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */

const { Authorize, Space, InitAPI, Common } = require("../");
const { testnetConfig, wellKnownAcct } = require("../config");
const { getDataIfOk } = require("../util");

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
    const space = new Space(api, keyring);
    const common = new Common(api, keyring);

    let result = await space.userOwnedSpace(addr);
    let blockHeight = await common.queryBlockHeight();
    result = common.formatSpaceInfo(result.data, blockHeight);
    console.log("query user owned space (before buySpace/expanionSpace):", result);

    if (result.totalSpace) {
      if (result.totalSpaceGib < 5) {
        // Only run this when the total space is within a reasonable limit.
        process.stdout.write("Running expansionSpace()...");
        try {
          result = await space.expansionSpace(mnemonic, 1);
          console.log(getDataIfOk(result));
        } catch (err) {
          console.error("error:", err);
        }
      }

      process.stdout.write("Running renewalSpace()...");
      try {
        result = await space.renewalSpace(mnemonic, 1);
        console.log(getDataIfOk(result));
      } catch (err) {
        console.error("error:", err);
      }
    } else {
      process.stdout.write("Running buySpace()...");
      try {
        result = await space.buySpace(mnemonic, 1);
        console.log(getDataIfOk(result));
      } catch (err) {
        console.error("error:", err);
      }
    }

    result = await space.userOwnedSpace(addr);
    blockHeight = await common.queryBlockHeight();
    result = common.formatSpaceInfo(result.data, blockHeight);
    console.log("query user owned space (after buySpace/expanionSpace):", result);
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
