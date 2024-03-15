/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */

const testnetConfig = {
  nodeURL: "wss://testnet-rpc1.cess.cloud/ws/",
  keyringOption: { type: "sr25519", ss58Format: 11330 },
  gateway: {
    url: "http://deoss-pub-gateway.cess.cloud/",
    addr: "cXhwBytXqrZLr1qM5NHJhCzEMckSTzNKw17ci2aHft6ETSQm9",
  },
};

function buildConfig(nodeURL = undefined, keyringOption = undefined, gateway = undefined) {
  return {
    nodeURL: nodeURL || testnetConfig.nodeURL,
    gateway: gateway || testnetConfig.gateway,
    keyringOption: keyringOption || testnetConfig.keyringOption,
  };
}

// The well-known account of Substrate:
//   https://github.com/substrate-developer-hub/substrate-developer-hub.github.io/issues/613
const wellKnownAcct = {
  addr: "cXfM39GD2MgZR4YE1w6EYuKBv9Ux8wRBtfwkALhc2Ss7tn3YA",
  mnemonicOrAccountId32:
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk//Brandon",
};

module.exports = {
  testnetConfig,
  buildConfig,
  wellKnownAcct,
};
