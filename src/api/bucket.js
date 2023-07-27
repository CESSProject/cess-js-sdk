const ControlBase = require("../control-base");
const { formatEntries } = require("../util/formatter");

module.exports = class Bucket extends ControlBase {
  constructor(api, keyring, isDebug) {
    super(api, keyring, isDebug);
  }
  async queryBucketList(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.userBucketList(accountId32);
      let data = ret.toHuman();
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async queryBucketList2(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.bucket.entries();
      let data = formatEntries(ret);
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async queryBucketList3(accountId32) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.bucket.keys(accountId32);
      let data =ret.toJSON()
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async queryBucketInfo(accountId32, name) {
    try {
      await this.api.isReady;
      let ret = await this.api.query.fileBank.bucket(accountId32, name);
      let data = ret.toJSON();
      return {
        msg: "ok",
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        msg: "ok",
        errMsg: error.message,
        error: JSON.stringify(error),
      };
    }
  }
  async createBucket(mnemonic, accountId32, name) {
    await this.api.isReady;
    const extrinsic = this.api.tx.fileBank.createBucket(accountId32, name);
    return await this.signAndSend(mnemonic, extrinsic);
  }
  async deleteBucket(mnemonic, accountId32, name) {
    await this.api.isReady;
    const extrinsic = this.api.tx.fileBank.deleteBucket(accountId32, name);
    return await this.signAndSend(mnemonic, extrinsic);
  }
};
