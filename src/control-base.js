/*
 * @Description: 
 * @Autor: fage
 * @Date: 2022-04-29 17:24:00
 * @LastEditors: fage
 * @LastEditTime: 2022-07-06 10:50:19
 */
const initApi = require("./init-api");
const { uint8ArrayToIP,base58ToIP } = require("./util");

module.exports = class ControlBase {
  constructor(config) {
    if (config && !config.nodeURL && config.api && config.keyring) {
      this.api = config.api;
      this.keyring = config.keyring;
      return;
    }
    const apiObj = initApi(config);
    this.api = apiObj.api;
    this.keyring = apiObj.keyring;
    this.debug = config.debug;
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
  getIP(raw, protoName, onlyone) {
    if (raw.length == 0) {
      return null;
    }
    const ips = [];
    for (let r of raw) {
      try {
        let ip='';
        if(typeof r[protoName] === 'string'){
          ip = base58ToIP(r[protoName]);
        }else{
          ip = uint8ArrayToIP(r[protoName]);
        }
        if(ip){
          ips.push("ws://" + ip);
        }
      } catch (e) {
        this.log(e);
      }
    }
    if (ips.length == 0) {
      return null;
    }
    // this.log("ips", ips);
    if (onlyone) {
      return ips[0];
    }
    return ips;
  }
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
};
