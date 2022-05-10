const ProgressBar = require("progress");
module.exports = class Bar {
  constructor(tpl, width, total) {
    const green = "\u001b[42m \u001b[0m";
    const red = "\u001b[41m \u001b[0m";
    this.bar = new ProgressBar(tpl, {
      //"  downloading [:bar] :rate/bps :percent :etas"
      complete: green,
      incomplete: red,
      width: width,
      total: total
    });
  }
  tick(len){
    this.bar.tick(len);
  }
};
