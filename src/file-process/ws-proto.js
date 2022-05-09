const WS = require("./ws-helper");
const proto = require("./proto-helper");

module.exports = class WsProto {
  init(wsUrl, protoFile, reqProto, resProto) {
    return new Promise(async (resole, reject) => {
      try {
        const protoObj = await proto(protoFile, [reqProto, resProto]);
        this.ReqMsg = protoObj[reqProto];
        this.RespMsg = protoObj[resProto];
        const ws = new WS(wsUrl);
        await ws.open();
        this.ws = ws;
        resole();
      } catch (e) {
        reject(e);
      }
    });
  }
  request(payload) {
    console.log('requesting ',payload);
    return new Promise(async (resole, reject) => {
      try {
        const errMsg = this.ReqMsg.verify(payload);
        if (errMsg) return reject(errMsg);
        const message = this.ReqMsg.create(payload);
        console.log(message);
        const buffer = this.ReqMsg.encode(message).finish();
        const res = await this.ws.send(buffer);
        const json = this.RespMsg.decode(res);
        resole(json);
      } catch (e) {
        reject(e);
      }
    });
  }
};
