const bs58 = require("bs58");

module.exports={
    uint8ArrayToString,
    uint8ArrayToIP
}
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
