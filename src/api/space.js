const ControlBase = require("../control-base");

module.exports = class Space extends ControlBase {
  constructor(api, keyring, isDebug) {
    super(api, keyring, isDebug);
  }  
  async userOwnedSpace(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.storageHandler.userOwnedSpace(accountId32);
      let data = ret.toJSON();
      if (data) {
        let human = ret.toHuman();
        data.state = human.state;
      }
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
  async buySpace(mnemonic, gibCount) {
    await this.api.isReady;
    const extrinsic = this.api.tx.storageHandler.buySpace(gibCount);
    return await this.signAndSend(mnemonic, extrinsic);
  }
  async expansionSpace(mnemonic, gibCount) {
    await this.api.isReady;
    const extrinsic = this.api.tx.storageHandler.expansionSpace(gibCount);
    return await this.signAndSend(mnemonic, extrinsic);
  }
  async renewalSpace(mnemonic, days) {
    await this.api.isReady;
    const extrinsic = this.api.tx.storageHandler.renewalSpace(days);
    return await this.signAndSend(mnemonic, extrinsic);
  }
};
