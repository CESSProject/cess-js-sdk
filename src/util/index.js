/*
 * @Description:
 * @Autor: fage
 * @Date: 2022-05-11 09:29:25
 * @LastEditors: fage
 * @LastEditTime: 2022-07-08 17:49:30
 */
const bs58 = require("bs58");
const fs = require("fs");
const path = require("path");
const execShell = require("./exec-shell");

module.exports = {
  uint8ArrayToString,
  uint8ArrayToIP,
  base58ToIP,
  stringToByte,
  byteToString,
  reedsolomonDecode,
};
function uint8ArrayToString(u8arr) {
  var dataString = "";
  for (var i = 0; i < u8arr.length; i++) {
    dataString += String.fromCharCode(u8arr[i]);
  }
  return dataString;
}
function uint8ArrayToIP(u8arr) {
  return uint8ArrayToString(bs58.decode(uint8ArrayToString(u8arr)));
}
function base58ToIP(u8arr) {
  return uint8ArrayToString(bs58.decode(u8arr));
}

function stringToByte(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}
function byteToString(arr) {
  if (typeof arr === "string") {
    return arr;
  }
  var str = "",
    _arr = arr;
  for (var i = 0; i < _arr.length; i++) {
    var one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length == 8) {
      var bytesLength = v[0].length;
      var store = _arr[i].toString(2).slice(7 - bytesLength);
      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(_arr[i]);
    }
  }
  return str;
}

function reedsolomonDecode(chunkDir, fileId, fileCount) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("process.platform", process.platform);
      const exeFile = path.join(__dirname, process.platform, "./");
      let dataCount = (fileCount * 2) / 3;
      let reCount = fileCount / 3;
      if (fileCount == 2) {
        dataCount = 2;
        reCount = 2;
      }
      const shellCom = `${exeFile}cess-rs ${chunkDir} ${fileId} ${dataCount} ${reCount}`;
      const result = await execShell(shellCom);
      console.log("execShell result", result);
      resolve({ msg: "ok", data: result });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}
