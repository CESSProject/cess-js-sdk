var protobuf = require("protobufjs");

module.exports =function loadProto(protoFile, typeNameArray) {
    return new Promise((resolve, reject) => {
      protobuf.load(protoFile, function (err, root) {
        if (err) return reject(err);
        if (!typeNameArray) return resolve(root);
        let o = {};
        for (let name of typeNameArray) {
          o[name] = root.lookupType(name);
        }
        resolve(o);
      });
    });
  }
  