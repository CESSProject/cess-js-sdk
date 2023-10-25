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
  const { api, keyring } = await InitAPI(testnetConfig);
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

  let spaceData = common.formatSpaceInfo(initSpace.data, blockHeight);
  console.log("initial user space:", spaceData);

  if (initSpaceData.totalSpace) {
    console.log("expansionSpace:", await space.expansionSpace(mnemonic, RENT_SPACE));
    console.log("renewalSpace:", await space.renewalSpace(mnemonic, RENEWAL_LEN));
  } else {
    console.log("buySpace:", await space.buySpace(mnemonic, RENT_SPACE));
  }

  const afterSpace = await space.userOwnedSpace(acctId);

  const afterSpace = await space.userOwnedSpace(acctId);
  spaceData = common.formatSpaceInfo(afterSpace.data, blockHeight);
  console.log("user space afterwards:", spaceData);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
```

More examples are in the [**examples**](./examples) directory.

To run them all, run the command:

```bash
pnpm examples
```

All examples connect to the Testnet and use the account `cXgaee2N8E77JJv9gdsGAckv1Qsf3hqWYf7NL4q6ZuQzuAUtB` as default with the following mnemonic:

```
bottom drive obey lake curtain smoke basket hold race lonely fit walk
```

This is the [well-known development account](https://github.com/substrate-developer-hub/substrate-developer-hub.github.io/issues/613) in Substrate. If you don't have the token needed, please fetch it from the [Testnet faucet](https://cess.cloud/faucet.html).

### CESS Testnet RPC Endpoints

```
wss://testnet-rpc0.cess.cloud/ws/
wss://testnet-rpc1.cess.cloud/ws/
wss://testnet-rpc2.cess.cloud/ws/
```

### CESS Testnet Faucet

```
https://testnet-faucet.cess.cloud/
```

### CESS Testnet Public Gateway

```
Address: https://deoss-pub-gateway.cess.cloud/
Account: cXhwBytXqrZLr1qM5NHJhCzEMckSTzNKw17ci2aHft6ETSQm9
```

## APIs

### CESS Config

The config object of `CESSConfig` type is:

```ts
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
```

### Space

- `userOwnedSpace(accountId32: string): Promise<APIReturnedData>`
- `buySpace(mnemonic: string, gibCount: number): Promise<any>`
- `expansionSpace(mnemonicOrAccountId32: string, gibCount: number): Promise<any>`
- `renewalSpace(mnemonic: string, days: number): Promise<any>`

### Authorize

- `authorityList(accountId32: string): Promise<APIReturnedData>`
- `authorize(mnemonic: string, operator: string): Promise<any>`
- `cancelAuthorize(mnemonic: string, operator: string): Promise<any>`

### Bucket

- `queryBucketNames(accountId32: string): Promise<APIReturnedData>`
- `queryBucketList(accountId32: string): Promise<APIReturnedData>`
- `queryBucketInfo(accountId32: string, name: string): Promise<APIReturnedData>`
- `createBucket(mnemonic: string, accountId32: string, name: string): Promise<any>`
- `deleteBucket(mnemonic: string, accountId32: string, name: string): Promise<any>`

### File

- `queryFileListFull(accountId32: string): Promise<APIReturnedData>`
- `queryFileList(accountId32: string): Promise<APIReturnedData>`
- `queryFileMetadata(fileHash: string): Promise<APIReturnedData>`
- `uploadFile(mnemonic: string, accountId32: string, filePath: string, bucketName: string): Promise<any>`
- `downloadFile(fileHash: string, savePath: string): Promise<any>`
- `deleteFile(mnemonic: string, accountId32: string, fileHashArray: string[]): Promise<any>`
