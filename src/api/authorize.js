/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 * 
 */
const ControlBase = require("../control-base");
const defaultConfig = require("../config");

module.exports = class Authorize extends ControlBase {
  constructor(api, keyring, isDebug) {
    super(api, keyring, isDebug);
  }
  async authorityList(accountId32) {
    try {      
      await this.api.isReady;
      let ret = await this.api.query.oss.authorityList(accountId32);
      let data = ret.toJSON();
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async authorize(mnemonic, operator) {
    await this.api.isReady;
    if (!operator) {
      operator = defaultConfig.gateway.account;
    }
    const extrinsic = this.api.tx.oss.authorize(operator);
    return await this.signAndSend(mnemonic, extrinsic);
  }
  async cancelAuthorize(mnemonic) {
    await this.api.isReady;
    const extrinsic = this.api.tx.oss.cancelAuthorize();
    return await this.signAndSend(mnemonic, extrinsic);
  }
};
