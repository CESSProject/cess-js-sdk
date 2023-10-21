/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 *
 */
const { Authorize, InitAPI } = require("../");

const config = require("../src/config");
const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const mnemonic = "";
let result = "";

const oss = new Authorize(api, keyring, true);

async function main() {
  try {
    console.log("==============query authorityList=======================");
    result = await oss.authorityList(accountId32);
    console.log(result.data);
    // return ;

    if (!result.data || result.data.length == 0) {
      console.log("==============authorize=======================");
      result = await oss.authorize(mnemonic, config.gateway.account);
      console.log(result);
    } else {
      console.log("==============cancelAuthorize=======================");
      result = await oss.cancelAuthorize(mnemonic);
      console.log(result);
    }

    console.log("==============query authorityList=======================");
    result = await oss.authorityList(accountId32);
    console.log(result);

    process.exit();
  } catch (e) {
    console.log(e);
  }
}

main();
