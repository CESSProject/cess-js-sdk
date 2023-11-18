/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */

const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { testnetConfig } = require("./config");

module.exports = async (config = testnetConfig) => {
  const wsProvider = new WsProvider(config.nodeURL);
  const api = await ApiPromise.create({ provider: wsProvider });
  const keyring = new Keyring(config.keyringOption);
  return { api, keyring };
};
