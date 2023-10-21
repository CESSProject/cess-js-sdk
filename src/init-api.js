/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */
const defaultConfig = require("./config");
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");

module.exports = async (config = defaultConfig) => {
  const wsProvider = new WsProvider(config.nodeURL);
  const api = await ApiPromise.create({ provider: wsProvider });
  const keyring = new Keyring(config.keyringOption);

  return { api, keyring };
};
