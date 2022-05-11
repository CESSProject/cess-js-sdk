const assert = require("assert");
const { FileStorage, Keyring } = require("../");

const accountId =
  "farm sugar tree vote wash post alley worry banner badge dwarf jungle";
const addr = "5EX5wLc4eRvEpGin3DKdMwhJzdGuFhUZDchaFEXVDaY9XiCA";
let fileId = "4N1aDXmSs2Nxt56abVoD7q";

const config = {
  nodeURL: "ws://106.15.44.155:9949/",
  keyringOption: { type: "sr25519", ss58Format: 42 },
};
const api = new FileStorage(config);

it("findPrice() should return a number", async function () {
  const result = await api.findPrice();
  console.log(result);
  assert.equal(typeof result, "number");
});
it("findPurchasedSpace(addr) should return a object or null", async function () {
  const result = await api.findPurchasedSpace(addr);
  console.log(result);
  if (!result) {
    assert.equal(result, null);
  } else {
    const ret = {
      purchasedSpace: 1048576,
      usedSpace: 0,
      remainingSpace: 1048576,
    };
    assert.deepEqual(result, ret);
  }
});
it("findFile(addr) should return a object or null", async function () {
  const result = await api.findFile(fileId);
  console.log(result);
  assert.deepEqual(result, null);
});
it("userHoldFileList(addr) should return a array or null", async function () {
  const result = await api.findFileList(addr);
  console.log(result);
  assert.equal(result == null || Array.isArray(result), true);
});
it("fileUpload(accountId...) should return null", async function () {
  const filePath = "./file/a.zip";
  let ispublic = true,
    privatekey = "123456",
    backups = 1,
    downloadfee = 0;
  const result = await api.fileUpload(
    accountId,
    filePath,
    privatekey,
    backups,
    downloadfee
  );
  console.log(result);
  assert.equal(result == null, true);
});
it("fileDownload(accountId...) should return a array or null", async function () {
  const fileSaveDir = "./file/down/";
  const privatekey = "123456";
  const fileId = "cwnbtK1XpnDkmP3fV9DKXg";
  const result = await api.fileDownload(
    accountId,
    fileId,
    fileSaveDir,
    privatekey
  );
  console.log(result);
  assert.equal(result, null);
});
it("expansion(accountId...)[buy space] should return a hash string", function (done) {
  const spaceCount = 1;
  const leaseCount = 1;
  const maxPrice = 0;
  api.expansion(accountId, spaceCount, leaseCount, maxPrice).then((hash) => {
    console.log(hash, hash.length);
    assert.equal(hash.length, 66);
    done();
  }, console.log);
});
it("fileDelete(accountId, fileId) should return null", async function (done) {
  const result = await api.fileDelete(accountId, fileId);
  console.log(result);
  assert.equal(result, null);
  done();
});

const keyring = new Keyring();
it("getGublicKeyFromMnemonic(accountId) should return a string", async function () {
  const result = await keyring.getPublicKeyFromMnemonic(accountId);
  console.log(result);
  assert.equal(result.length, 66);
});
it("getGublicKeyFromAccountId(addr) should return a string", async function () {
  const result = await keyring.getPublicKeyFromAccountId(addr);
  console.log(result);
  assert.equal(result.length, 66);
});