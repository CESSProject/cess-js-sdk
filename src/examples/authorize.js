/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 *
 */
const { Authorize, InitAPI, testnetConfig, wellKnownAcct } = require("../../");
const { getDataIfOk } = require("../util");

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);
  const { mnemonic, addr, gatewayAddr } = wellKnownAcct;

  const oss = new Authorize(api, keyring);

  console.log("query authorityList:");
  let result = await oss.authorityList(addr);
  console.log(result.data, "\n");

  console.log("authorize:");
  result = await oss.authorize(mnemonic, gatewayAddr);
  console.log(getDataIfOk(result), "\n");

  console.log("query authorityList:");
  result = await oss.authorityList(addr);
  console.log(getDataIfOk(result), "\n");

  console.log("cancelAuthorize:");
  result = await oss.cancelAuthorize(mnemonic, gatewayAddr);
  console.log(getDataIfOk(result), "\n");

  console.log("query authorityList:");
  result = await oss.authorityList(addr);
  console.log(getDataIfOk(result));

  // console.log("authorize:");
  await oss.authorize(mnemonic, gatewayAddr);
  // console.log(getDataIfOk(result), "\n");
}

main()
  .catch(console.error)
  .finally(() => process.exit());
