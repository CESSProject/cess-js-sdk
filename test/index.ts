import {FileStorage,Keyring} from '../index.js';

let config: any = {
  nodeURL: "ws://106.15.44.155:9948/",
  keyringOption: { type: "sr25519", ss58Format: 42 },
};
const fileStorage=new FileStorage(config);
const k=new Keyring(config);
fileStorage.findPrice().then(console.log,console.error);