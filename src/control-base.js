let web3Enable = () => [];
let web3FromAddress = () => {
  return {};
};
let web3Accounts = () => {};
let web3FromSource = () => {};
const isBrower =
  typeof window != "undefined" && typeof window.document != "undefined";

if (isBrower) {
  const extension = require("@polkadot/extension-dapp");
  web3Enable = extension.web3Enable;
  web3FromAddress = extension.web3FromAddress;
  web3Accounts = extension.web3Accounts;
  web3FromSource = extension.web3FromSource;
}
const util = require("../src/util/index");
const { stringToHex } = require("@polkadot/util");

module.exports = class ControlBase {
  constructor(api, keyring, isDebug) {
    this.api = api;
    this.keyring = keyring;
    this.debug = isDebug;
  }
  log = (...msg) => {
    if (this.debug) {
      console.log(...msg);
    }
  };
  error = (...msg) => {
    if (this.debug) {
      console.error(...msg);
    }
  };
  async sign(mnemonic, tx) {
    const api = this.api;
    await api.isReady;
    const pair = this.keyring.createFromUri(mnemonic);
    const { nonce } = await api.query.system.account(pair.address);
    // create the payload
    const signer = api.createType("SignerPayload", {
      method: tx,
      nonce,
      genesisHash: api.genesisHash,
      blockHash: api.genesisHash,
      runtimeVersion: api.runtimeVersion,
      version: api.extrinsicVersion,
    });
    const { signature } = api
      .createType("ExtrinsicPayload", signer.toPayload(), {
        version: api.extrinsicVersion,
      })
      .sign(pair);
    tx.addSignature(pair.address, signature, signer.toPayload());
    return tx.toHex();
  }
  async submitTransaction(transaction) {
    return new Promise(async (resolve, reject) => {
      await this.api.isReady;
      const api = this.api;
      let tx;
      try {
        tx = api.tx(transaction);
      } catch (err) {
        reject(err);
      }
      try {
        const hash = await api.rpc.author.submitExtrinsic(tx);
        resolve(hash.toHex());
      } catch (err) {
        reject(err);
      }
    });
  }
  signAndSend(mnemonic, extrinsic) {
    return new Promise(async (resolve, reject) => {
      try {
        if (mnemonic.length < 55) {
          let result = await this.signAndSendWeb3(mnemonic, extrinsic);
          return resolve(result);
        }
        await this.api.isReady;
        const pair = this.keyring.createFromUri(mnemonic);
        const extrinsicHash = extrinsic.hash.toHex();
        const unsub = await extrinsic.signAndSend(pair, (result) => {
          // this.log(result.toHuman());
          if (result.status.isInBlock || result.status.isFinalized) {
            unsub();
            if (!result.dispatchInfo) {
              return reject({
                msg: "Cannot get `dispatchInfo` from the result.",
              });
            } else if (result.dispatchError) {
              return reject({
                msg: "dispatchError",
                data: result.dispatchError.toHuman(),
              });
            }
            resolve({ msg: "ok", data: extrinsicHash });
          } else if (result.status.isDropped) {
            unsub();
            reject("isDropped");
          } else if (result.status.isFinalityTimeout) {
            unsub();
            reject(
              `Finality timeout at block hash '${result.status.asFinalityTimeout}'.`
            );
          } else if (result.isError) {
            unsub();
            reject(result.toHuman());
          } else {
            this.log(result.toHuman());
          }
        });
      } catch (e) {
        this.error(e);
        reject(e.message);
      }
    });
  }
  async signAndSendWeb3(accountId32, extrinsic) {
    return new Promise(async (resolve, reject) => {
      try {
        const extensions = await web3Enable("my cool dapp");
        if (extensions.length === 0) {
          return reject(
            "no extension installed, or the user did not accept the authorization"
          );
        }
        await this.api.isReady;
        const injector = await web3FromAddress(accountId32);
        extrinsic.signAndSend(
          accountId32,
          { signer: injector.signer },
          (status) => {
            try {
              console.log("status.status.toJSON()", status.status.toJSON());
              console.log("isFinalized", status.isFinalized);
              if (status.isFinalized) {
                const extrinsicHash = extrinsic.hash.toHex();
                resolve({ msg: "ok", data: extrinsicHash });
              }
            } catch (e) {
              console.log(e);
              reject(e.message);
            }
          },
          (e) => {
            console.log(e);
          }
        );
      } catch (e) {
        console.log(e);
        reject(e.message);
      }
    });
  }
  async authSign(mnemonic, msg) {
    if (isBrower) {
      const extensions = await web3Enable("my cool dapp");
      const allAccounts = await web3Accounts();
      console.log({ allAccounts });
      allAccounts.forEach((t) => {
        t.address = this.formatAccountId(t.address);
      });
      const account = allAccounts.find((t) => t.address == mnemonic);
      const injector = await web3FromSource(account.meta.source);
      const signRaw = injector?.signer?.signRaw;
      const { signature } = await signRaw({
        address: account.address,
        data: stringToHex(msg),
        type:"Uint8Array",
      });
      return {
        signU8A: signature,
      };
    } else {
      await this.api.isReady;
      let kr = this.keyring;
      const pair = kr.createFromUri(mnemonic);
      kr.setSS58Format(11330);
      const publicKeyU8A = pair.publicKey;
      // console.log("publicKeyU8A", publicKeyU8A);
      const ss58 = pair.address;
      const signU8A = pair.sign(msg);
      // console.log("signU8A", signU8A);
      const publicKeyStr = util.uint8ArrayToHex(publicKeyU8A);
      const signStr = util.uint8ArrayToHex(signU8A);
      return {
        mnemonic,
        msg,
        publicKeyU8A,
        publicKeyStr,
        signU8A,
        signStr,
        ss58,
      };
    }
  }
  formatAccountId(accountId32) {
    if (!accountId32 || accountId32.length == 64) {
      return accountId32;
    }
    const pair = this.keyring.addFromAddress(accountId32);
    this.keyring.setSS58Format(11330);
    return pair.address;
  }
};
