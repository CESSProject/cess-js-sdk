import { Space, InitAPI, Common } from "../../";

// If you need testnet tokens, goto CESS testnet faucet at:
// https://cess.cloud/faucet.html

// Substrate well-known mnemonic. Don't use them in production:
//  https://github.com/substrate-developer-hub/substrate-developer-hub.github.io/issues/613
const mnemonic = "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
const acctId = "cXgaee2N8E77JJv9gdsGAckv1Qsf3hqWYf7NL4q6ZuQzuAUtB";

const RENT_SPACE = 1; // unit in GB.
const RENEWAL_LEN = 1; // unit in day.

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
  const { data } = balanceEncoded.toJSON() as { data: { free: string } };
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
