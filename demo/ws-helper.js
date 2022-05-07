const WebSocket = require("ws");
let ws = null;
let wsIsOpen = true;
let cb = (data) => {
  console.log("ws reseid mesage", data);
};

function open(url) {
  return new Promise((resole, reject) => {
    ws = new WebSocket(url);
    ws.on("open", () => {
      console.log("ws is open ", url);
      wsIsOpen = true;
      resole();
    });
    ws.on("close", () => {
      wsIsOpen = false;
      console.log("ws is close ", url);
    });
    ws.on("error", (e) => {
      wsIsOpen = false;
      console.log("ws is error ", e);
    });
    ws.on("message", (data)=>{
        cb(data);
    });
  });
}
function send(msg) {
  return new Promise((resole, reject) => {
    if (!ws) {
      return reject("WebSocket not init ");
    }
    if (!wsIsOpen) {
      return reject("WebSocket is closed ");
    }
    cb = (data) => {
      console.log("ws res mesage", data);
      resole(data);
    };
    ws.send(msg);
  });
}
module.exports = {
  open,
  send,
};
