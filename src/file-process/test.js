const fileSlice = require("fs-slicer");
const md5File = require("md5-file");

module.exports = { slice, join, check };

function check(filePath, filePath2) {
  let hash1 = md5File.sync(filePath);
  let hash2 = md5File.sync(filePath2);
  return hash1 == hash2;
}

async function slice(sourFilePath) {
  const buffInfoArray = fileSlice.getSliceInfoArr(sourFilePath, 100); // max length 2MB  = 2097152
  const bufs = [];
  for (const info of buffInfoArray) {
    const buf = await fileSlice.readOneBlock(sourFilePath, info);
    bufs.push(buf);
  }
  return bufs;
}
async function join(filePath, bufs) {
  await fileSlice.joinBlcoksToFile(filePath, bufs);
}

// const fs = require("fs");
// let f1='./file/a.zip';
// let f2='./file/b.zip';
// async function test(){
//   if(!fs.existsSync(f1)){
//     return console.log('f1 not found');
//   }
//   let bufs=await slice(f1);
//   await join(f2, bufs);
//   console.log('check result',check(f1,f2));
// }
// test().then(()=>{},console.log);
