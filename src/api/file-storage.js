const ControlBase = require("../control-base");

module.exports = class ControlApi extends ControlBase {
  constructor(config) {
    super(config);
  }
  async timestamp() {
    await this.api.isReady;
    const result = await this.api.query.timestamp.now();
    return result.toJSON();
  }
  //Find curr price
  async findPrice() {
    try {
      await this.api.isReady;
      let result = await this.api.query.sminer.purchasedSpace();
      const purchased = parseFloat(result.toJSON());
      result = await this.api.query.sminer.availableSpace();
      const available = parseFloat(result.toJSON());
      const price = (1024 / parseFloat(available - purchased)) * 1000; //CESS/MB
      return price;
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find my space by accountId(wallet address)
  async findPurchasedSpace(accountId) {
    try {
      if (!accountId) {
        throw "accountId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldSpaceDetails(
        accountId
      );
      return result.toJSON();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find file info by fileId
  async findFile(fileId) {
    try {
      if (!fileId) {
        throw "fileId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.file(fileId);
      return result.toJSON();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //Find my hold file list by accountId
  async userHoldFileList(accountId) {
    try {
      if (!accountId) {
        throw "accountId is null";
      }
      await this.api.isReady;
      let result = await this.api.query.fileBank.userHoldFileList(accountId);
      return result.toJSON();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  //File upload
  // async fileUpload(path, backups, privatekey) {
  //   try {
  //     if (!accountId) {
  //       throw "accountId is null";
  //     }
  //     await this.api.isReady;
  //     let result = await this.api.query.fileBank.userHoldFileList(accountId);
  //     return result.toJSON();
  //   } catch (e) {
  //     console.error(e);
  //     return e;
  //   }
  // }
};
