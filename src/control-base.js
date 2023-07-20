const {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} = require("@polkadot/extension-dapp");

module.exports = class ControlBase {
  constructor(api, keyring, isDebug) {
    this.api = api;
    this.keyring = keyring;
    this.debug = isDebug;
  }
  progressLog = (key, msg, data, per = 0, isComplete = false) => {
    global[key] = {
      msg,
      per,
      data,
      isComplete,
    };
  };
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
  async signAndSend(mnemonic, extrinsic) {
    return new Promise(async (resolve, reject) => {
      try {
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
};
