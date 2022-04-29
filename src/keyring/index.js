const ControlBase = require("../control-base");

module.exports = class ControlApi extends ControlBase {
  constructor(config) {
    super(config);
  }
  async getGublicKeyFromMnemonic(mnemonic) {
    await this.api.isReady;
    const pair = this.keyring.createFromUri(mnemonic);
    return "0x" + this.toHexString(pair.publicKey);
  }
  async getGublicKeyFromAccountId(accountId) {
    await this.api.isReady;
    const pair = this.keyring.addFromAddress(accountId);
    return "0x" + this.toHexString(pair.publicKey);
  }
  toHexString(arr) {
    return Array.from(arr, (i) => i.toString(16).padStart(2, "0")).join("");
  }
};
