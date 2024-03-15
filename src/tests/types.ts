import { Space, InitAPI, Common, testnetConfig, wellKnownAcct } from "../../";

// If you need testnet tokens, goto CESS testnet faucet at:
// https://cess.cloud/faucet.html

// Substrate well-known mnemonic. Don't use them in production:
//  https://github.com/substrate-developer-hub/substrate-developer-hub.github.io/issues/613
const { addr: acctId } = wellKnownAcct;

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
  const { data } = balanceEncoded.toJSON() as { data: { free: string } };
  console.log(`User: ${acctId}, balance:`, BigInt(data.free));

  const initSpace = await space.userOwnedSpace(acctId);
  console.log("query userOwnedSpace:", initSpace);

  const blockHeight = await common.queryBlockHeight();
  console.log("current block height:", blockHeight);

  const spaceData = common.formatSpaceInfo(initSpace.data, blockHeight);
  console.log("user space:", spaceData);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
