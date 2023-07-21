const util = require("../src/util/index");
const { u8aToHex } = require("@polkadot/util");


let u8=new Uint8Array([0, 1, 2, 42, 100, 101, 102, 255]);
let tmp=util.uint8ArrayToHex(u8);
console.log(tmp);
tmp=u8aToHex(u8);
console.log(tmp);