/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 *
 */
const { Authorize, InitAPI, testnetConfig, wellKnownAcct } = require("../../");
const { getDataIfOk } = require("../util");

async function main() {
  const { api, keyring } = await InitAPI(testnetConfig);
  const { gateway } = testnetConfig;
  const { mnemonicOrAccountId32: mnemonic, addr } = wellKnownAcct;

  const authService = new Authorize(api, keyring);

  let result = await authService.authorityList(addr);
  console.log(`AuthorityList before "authorize()" action:`, getDataIfOk(result));

  process.stdout.write("Running authorize()...");
  result = await authService.authorize(mnemonic, gateway.addr);
  console.log(getDataIfOk(result));

  result = await authService.authorityList(addr);
  console.log(`AuthorityList after "authorize()" action:`, getDataIfOk(result));

  process.stdout.write("Running cancelAuthorize()...");
  result = await authService.cancelAuthorize(mnemonic, gateway.addr);
  console.log(getDataIfOk(result));

  result = await authService.authorityList(addr);
  console.log(`AuthorityList after "cancelAuthorize()" action:`, getDataIfOk(result));
}

main()
  .catch(console.error)
  .finally(() => process.exit());
