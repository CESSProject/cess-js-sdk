# cess-js-sdk

## About

A js-sdk for Cess Project with file storage

Supports CommonJS and ES Module import type

Support for use in node.js and browsers,use in browser, it is necessary to install the Polkadot wallet plugin in the browser https://polkadot.js.org/extension/

## Install

### npm
```bash
npm i cess-js-sdk --save
```

### or yarn

```bash
yarn add cess-js-sdk -S
```

## Use

```javascript
const { Space, InitAPI, Common } = require("cess-js-sdk");
// or for ES6
// import { Space, InitAPI, Common} from "cess-js-sdk";
const { api, keyring } = InitAPI();

const space = new Space(api, keyring, true);
const common = new Common(api, keyring, true);
async function main() {
  try {
    console.log("==============query userOwnedSpace=======================");
    result = await space.userOwnedSpace(accountId32);
    // console.log(result);
    const blockHeight = await common.queryBlockHeight();
    await common.formatSpaceInfo(result.data, blockHeight);
    console.log(result);
    // return;

    if (result.data?.totalSpace) {
      console.log("==============expansionSpace=======================");
      result = await space.expansionSpace(mnemonic, 1);
      console.log(result);

      console.log("==============renewalSpace=======================");
      result = await space.renewalSpace(mnemonic, 5);
      console.log(result);
    } else {
      console.log("==============buySpace=======================");
      result = await space.buySpace(mnemonic, 1);
      console.log(result);
    }

    console.log("==============query userOwnedSpace=======================");
    result = await space.userOwnedSpace(accountId32);
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

main();

```

### CESS test network rpc endpoints

```sh
wss://testnet-rpc0.cess.cloud/ws/
wss://testnet-rpc1.cess.cloud/ws/
wss://testnet-rpc2.cess.cloud/ws/
```


###  CESS test network faucet

```sh
https://testnet-faucet.cess.cloud/
```

### CESS test network public gateway
```sh
Address ： https://deoss-pub-gateway.cess.cloud/
Account ： cXhwBytXqrZLr1qM5NHJhCzEMckSTzNKw17ci2aHft6ETSQm9
```