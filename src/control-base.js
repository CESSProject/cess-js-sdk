/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 */
let extension = null;
let web3Enable = () => [];
let web3FromAddress = () => {
  return {};
};
let web3Accounts = () => {};
let web3FromSource = () => {};
const isBrower = typeof window != "undefined" && typeof window.document != "undefined";

if (isBrower) {
  console.log("init polkadot/extension-dapp");
  extension = require("@polkadot/extension-dapp");
  web3Enable = extension.web3Enable;
  web3FromAddress = extension.web3FromAddress;
  web3Accounts = extension.web3Accounts;
  web3FromSource = extension.web3FromSource;
}
const util = require("../src/util/index");
const { stringToHex, hexToU8a, u8aConcat, u8aToHex } = require("@polkadot/util");

module.exports = class ControlBase {
  constructor(api, keyring, isDebug = false) {
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
    /* eslint-disable-next-line no-async-promise-executor */
    return new Promise(async (resolve, reject) => {
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

  signAndSend(mnemonic, extrinsic, subState = null) {
    /* eslint-disable-next-line no-async-promise-executor */
    return new Promise(async (resolve, reject) => {
      try {
        if (mnemonic.length < 55) {
          let result = await this.signAndSendWeb3(mnemonic, extrinsic, subState);
          return resolve(result);
        }
        const pair = this.keyring.createFromUri(mnemonic);
        const extrinsicHash = extrinsic.hash.toHex();
        const unsub = await extrinsic.signAndSend(pair, (result) => {
          // this.log(result.toHuman());
          if (subState && typeof subState == "function") {
            subState(result.toHuman());
          }
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
            reject(`Finality timeout at block hash '${result.status.asFinalityTimeout}'.`);
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

  async signAndSendWeb3(accountId32, extrinsic, subState = null) {
    /* eslint-disable-next-line no-async-promise-executor */
    return new Promise(async (resolve, reject) => {
      try {
        const extensions = await web3Enable("CESS dApp");
        if (extensions.length === 0) {
          return reject("no extension installed, or the user did not accept the authorization");
        }

        const injector = await web3FromAddress(accountId32);
        extrinsic.signAndSend(
          accountId32,
          { signer: injector.signer },
          (status) => {
            try {
              if (subState && typeof subState == "function") {
                subState(status);
              }
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
          },
        );
      } catch (e) {
        console.log(e);
        reject(e.message);
      }
    });
  }

  async authSign(mnemonic, msg) {    
    if (isBrower) {
      // console.log("Is in brower.");
      await web3Enable("cess");
      const allAccounts = await web3Accounts();

      allAccounts.forEach((t) => {
        // t.setSS58Format(11330);
        t.address = this.formatAccountId(t.address);
      });
      let account = allAccounts.find((t) => t.address == mnemonic);
      if (!account) {
        account = allAccounts[0];
        console.log("account not found!", allAccounts);
        // return { msg: "account not found!" };
        return {
          signU8A: null,
          signStr:null
        };
      }
      const injector = await web3FromSource(account.meta.source);
      const signRaw = injector?.signer?.signRaw;
      if (!signRaw) {
        return {
          signU8A: null,
          signStr:null
        };
      }
      // after making sure that signRaw is defined
      // we can use it to sign our message
      const { signature } = await signRaw({
        address: account.address,
        data: stringToHex(msg),
        type: "bytes",
      });
      // console.log({ signature });
      let signU8A = hexToU8a(signature);

      return {
        signU8A,
        signStr:signature
      };
    } else {
      // console.log("Is in node.");
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
