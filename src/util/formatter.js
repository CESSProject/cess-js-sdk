const _ = require("lodash");

module.exports = {
  formatEntries,
  formatterSize,
  formatterSize2,
  formatBalance,
  formatAddress,
  formatAddressLong,
  fixed,
  formatTime,
};
function formatEntries(result, isNeedSourceKey) {
  return result.map(([key, entry]) => {
    let ids = key.args.map((k) => k.toHuman());
    let id = ids[0];

    let humanObj = entry.toJSON();
    if (ids.length > 0) {
      humanObj.ids = ids;
    }
    if (isNeedSourceKey) {
      return _.assign(humanObj, { key: id, sourceKey: key });
    }
    return _.assign(humanObj, { key: id });
  });
}

function formatterSize(size) {
  let obj = formatterSize2(size);
  return obj.size + " " + obj.ext;
}
function formatterSize2(size) {
  let count = size;
  if (!count) {
    // console.log('!count',count);
    return "0 KiB";
  }
  if (_.isString(count)) {
    count = _.toNumber(count);
  }
  if (count === 0) return "0 KiB";
  let k = 1024;
  let currencyStr = [
    "iB",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];
  let i = 0;
  for (let l = 0; l < 8; l++) {
    if (count / Math.pow(k, l) < 1) {
      break;
    }
    i = l;
  }
  return {
    size: (count / _.round(Math.pow(k, i))).toFixed(2),
    ext: currencyStr[i],
  };
}
function formatBalance(balance) {
  if (!balance) {
    return "";
  }
  if (typeof balance == "object" && balance.free) {
    balance = parseInt(balance.free.toString());
  }
  if (isNaN(balance)) {
    return balance;
  }
  return fixed(balance / 1000000000000);
}
function formatAddress(addr) {
  if (!addr) return "";
  if (addr.length < 10) return addr;
  return addr.slice(0, 5) + "..." + addr.slice(-5);
}
function formatAddressLong(addr) {
  if (!addr) return "";
  if (addr.length < 26) return addr;
  return addr.slice(0, 13) + "..." + addr.slice(-13);
}
function fixed(n) {
  return Math.floor(n * 100) / 100;
}
function formatTime(time) {
  let h = parseInt((time / 60 / 60) % 24);
  h = h < 10 ? "0" + h : h;
  let m = parseInt((time / 60) % 60);
  m = m < 10 ? "0" + m : m;
  let s = parseInt(time % 60);
  s = s < 10 ? "0" + s : s;
  // return [h, m, s]
  if (h > 0) {
    return h + ":" + m + ":" + s;
  } else {
    return m + ":" + s;
  }
}
