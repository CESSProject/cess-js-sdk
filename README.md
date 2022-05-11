# cess-js-sdk

## About

A js-sdk for Cess Project with file storage


## Install

### npm
```bash
npm i cess-js-sdk --save
```

### or yarn

```bash
yarn add cess-js-sdk -S
```

## Unit test

```bash
npm test
```

```javascript
const { FileStorage, Keyring } = require("cess-js-sdk");
const accountId='my wallet address';

const config={
  nodeURL: "ws://106.15.44.155:9948/",
  keyringOption: { type: "sr25519", ss58Format: 42 },
}
const api = new FileStorage(config);


//Find curr price
api.findPrice().then(console.log,console.log);

//Find my space by accountId(wallet address)
api.findPurchasedSpace(accountId).then(console.log,console.log);

//Find file info by fileId
const fileId="1518914542229331968";//example fileId
api.findFile(fileId).then(console.log,console.log);

//Find my hold file list by accountId
api.userHoldFileList(accountId).then(console.log,console.log);

//Keyring api
const keyring = new Keyring();

// Mnemonic to PublicKey
keyring.getPublicKeyFromMnemonic(accountId).then(console.log,console.log);


// Wallet address to PublicKey
const addr='AccountId is wallet address';
keyring.getPublicKeyFromAccountId(addr).then(console.log,console.log);
```