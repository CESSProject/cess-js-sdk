const mnemonicGenerate = require("@polkadot/util-crypto");
const { u8aToHex } = require("@polkadot/util");

class Converter {
  static addressToEvm(addr) {
    return u8aToHex(mnemonicGenerate.addressToEvm(addr));
  }
  static evmToAddress(evm, ss58Format = 11330) {
    return mnemonicGenerate.evmToAddress(evm, ss58Format);
  }
}

module.exports = Converter;

// console.log(Converter.addressToEvm('KWCv1L3QX9LDPwY4VzvLmarEmXjVJidUzZcinvVnmxAJJCBou')=='0x03b9dc646dd71118e5f7fda681ad9eca36eb3ee9');
// console.log(Converter.evmToAddress('0xd43593c715fdd31c61141abd04a99fd6822c8558'));
