# cess-js-sdk

## About

JS-SDK for Cess Project with file storage.

Supports CommonJS and ES Module import type.

Support usage in both node.js and browsers. If used in browser, please install the [Polkadot.js extension](https://polkadot.js.org/extension/) in the browser.

## Installation

```bash
# npm
npm i cess-js-sdk --save
# yarn
yarn add cess-js-sdk -S
# pnpm
pnpm add cess-js-sdk
```

## Example

```ts
async function main() {
  const { api, keyring } = await InitAPI();
  console.log("API initialized");

  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);
  console.log(`Connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  const space = new Space(api, keyring);
  const common = new Common(api, keyring);

  const balanceEncoded = await api.query.system.account(acctId);
  const { data } = balanceEncoded.toJSON() as { data: any };
  console.log(`User: ${acctId}, balance:`, BigInt(data.free));

  const initSpace = await space.userOwnedSpace(acctId);
  console.log("query userOwnedSpace:", initSpace);

  const blockHeight = await common.queryBlockHeight();
  console.log("current block height:", blockHeight);

  const { data: initSpaceData } = initSpace;
  common.formatSpaceInfo(initSpaceData, blockHeight);
  console.log("initial user space:", initSpaceData);

  if (initSpaceData.totalSpace) {
    console.log("expansionSpace:", await space.expansionSpace(mnemonic, RENT_SPACE));
    console.log("renewalSpace:", await space.renewalSpace(mnemonic, RENEWAL_LEN));
  } else {
    console.log("buySpace:", await space.buySpace(mnemonic, RENT_SPACE));
  }

  const afterSpace = await space.userOwnedSpace(acctId);

  const { data: afterSpaceData } = afterSpace;
  common.formatSpaceInfo(afterSpaceData, blockHeight);
  console.log("user space afterwards:", afterSpaceData);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
```

[More examples are here](./examples).

### CESS Testnet RPC Endpoints

```sh
wss://testnet-rpc0.cess.cloud/ws/
wss://testnet-rpc1.cess.cloud/ws/
wss://testnet-rpc2.cess.cloud/ws/
```

### CESS Testnet Faucet

```sh
https://testnet-faucet.cess.cloud/
```

### CESS Testnet Public Gateway

```sh
Address ： https://deoss-pub-gateway.cess.cloud/
Account ： cXhwBytXqrZLr1qM5NHJhCzEMckSTzNKw17ci2aHft6ETSQm9
```

## APIs

### Space

- `userOwnedSpace(AccountId32)`
- `buySpace(gibCount)`
- `expansionSpace(gibCount)`
- `renewalSpace(days)`

### Authorize

- `authorityList(accountId32)`
- `authorize(mnemonic,config.gateway.account)`
- `cancelAuthorize(mnemonic)`

### Bucket

- `queryBucketList(accountId32)`
- `createBucket(mnemonic, accountId32, buckname)`
- `queryBucketInfo(accountId32)`
- `deleteBucket(mnemonic,accountId32, buckname)`

### File

- `queryFileListFull(accountId32)`
- `queryFileMetadata(fileHash)`
- `uploadFile(mnemonic, accountId32, filePath, bucketName)`
- `downloadFile(fileHash, savePath)`
- `deleteFile(mnemonic, accountId32, [fileHash])`
