/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */

const testnetConfig = {
  nodeURL: "wss://testnet-rpc0.cess.cloud/ws/",
  keyringOption: { type: "sr25519", ss58Format: 42 },
  gatewayURL: "http://deoss-pub-gateway.cess.cloud/",
};

function buildConfig(nodeURL, gatewayURL, keyringOption) {
  return {
    nodeURL,
    gatewayURL,
    // default value for keyring option
    keyringOption: keyringOption || {
      type: "sr25519",
      ss58Format: 42,
    },
  };
}

// The well-known account of Substrate:
//   https://github.com/substrate-developer-hub/substrate-developer-hub.github.io/issues/613
const wellKnownAcct = {
  addr: "cXgaee2N8E77JJv9gdsGAckv1Qsf3hqWYf7NL4q6ZuQzuAUtB",
  mnemonic: "bottom drive obey lake curtain smoke basket hold race lonely fit walk",
  gatewayAddr: "cXhwBytXqrZLr1qM5NHJhCzEMckSTzNKw17ci2aHft6ETSQm9",
};

module.exports = {
  testnetConfig,
  buildConfig,
  wellKnownAcct,
};
