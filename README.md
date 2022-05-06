# cess-js-sdk

## About

js-sdk for Cess Project file storage


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
const Cess = require("cess-js-sdk");


const config={
  nodeURL: "ws://106.15.44.155:9948/",
  keyringOption: { type: "sr25519", ss58Format: 42 },
}
const cess =new Cess(config);
const accountId='my wallet address';

//Find curr price
api.findPrice().then(console.log,console.log);

//Find my space by accountId(wallet address)
api.findPurchasedSpace(accountId).then(console.log,console.log);

//Find file info by fileId
const fileId="1518914542229331968";//example fileId
api.findFile(fileId).then(console.log,console.log);

//Find my hold file list by accountId
api.userHoldFileList(accountId).then(console.log,console.log);

```