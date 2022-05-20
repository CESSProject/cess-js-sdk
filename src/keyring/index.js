const defaultConfig = require("../config");
const { Keyring } = require("@polkadot/api");

module.exports = class MyKeyring extends Keyring {
  constructor(config = defaultConfig) {
    super(config.keyringOption);
  }
  async getPublicKeyFromMnemonic(mnemonic) {
    const pair = this.createFromUri(mnemonic);
    return "0x" + this.toHexString(pair.publicKey);
  }
  async getPublicKeyFromAccountId(accountId) {
    const pair = this.addFromAddress(accountId);
    return "0x" + this.toHexString(pair.publicKey);
  }
  toHexString(arr) {
    return Array.from(arr, (i) => i.toString(16).padStart(2, "0")).join("");
  }
};
