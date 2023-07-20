const { Authorize, InitAPI, Common } = require("../");

const config = require("../src/config");
const { api, keyring } = InitAPI();
const accountId32 = "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe";
const accountId32_2 = "cXgdDQ65sFMX7hB9EbF42nys6XxSFLMTeQK2RoQkoopn26kXZ";
const mnemonic =
  "denial empower wear venue distance leopard lamp source off other twelve permit";
let result = "";

const oss = new Authorize(api, keyring, true);
const common = new Common(api, keyring, true);


async function main() {
  try {
    console.log("==============query authorityList=======================");
    result = await oss.authorityList(accountId32);
    console.log(result.data);
    // return ;

    if (result.data==null) {
      console.log("==============authorize=======================");
      result = await oss.authorize(mnemonic,config.gateway.account);
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
