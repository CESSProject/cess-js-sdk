export default class ControlBase {
  constructor(config:any)
  log(...msg):void;
  error(...msg):void;
  getIP(raw, protoName, onlyone):string;
  sign(mnemonic, tx):string;
  submitTransaction(transaction):string
}
