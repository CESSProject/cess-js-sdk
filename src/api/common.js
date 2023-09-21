/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 * 
 */
const ControlBase = require("../control-base");
const formatter = require("../util/formatter");
const moment = require("moment");

module.exports = class Common extends ControlBase {
  constructor(api, keyring, isDebug) {
    super(api, keyring, isDebug);
  }
  async queryBlockHeight() {
    await this.api.isReady;
    let ret = await this.api.query.system.number();
    let blockHeight = ret.toJSON();
    return blockHeight;
  }
  formatSpaceInfo(obj, blockHeight) {
    if (!obj) return obj;
    if (obj.totalSpace) {
      obj.totalSpaceGib = obj.totalSpace / 1073741824;
      obj.totalSpaceStr = formatter.formatterSize(obj.totalSpace);
    }
    if (obj.usedSpace) {
      obj.usedSpaceGib = obj.usedSpace / 1073741824;
      obj.usedSpaceStr = formatter.formatterSize(obj.usedSpace);
    }
    if (obj.lockedSpace) {
      obj.lockedSpaceGib = obj.lockedSpace / 1073741824;
      obj.lockedSpaceStr = formatter.formatterSize(obj.lockedSpace);
    }
    if (obj.remainingSpace) {
      obj.remainingSpaceGib = obj.remainingSpace / 1073741824;
      obj.remainingSpaceStr = formatter.formatterSize(obj.remainingSpace);
    }
    if (obj.deadline && blockHeight) {
      let s = (obj.deadline - blockHeight) * 6;
      let time = moment().add(s, "s");
      obj.deadlineTime = time.format("YYYY-MM-DD HH:mm:ss");
      obj.remainingDays = parseInt(s / 86400);
    }
  }
};
