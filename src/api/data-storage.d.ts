import ControlBase from "../control-base";

export class DataStorage extends ControlBase {
  constructor(config: any);
  public getStoreTxHash(
    mnemonic: string,
    filePath: string,
    fileid: string,
    keyword: string
  ): Promise<any>;
  public getRetrieveTxHash(mnemonic: string, fileid: string): Promise<any>;
  public getReplaceTxHash(
    mnemonic: string,
    filePath: string,
    oldFileid: string,
    newFileid: string,
    keyword: string
  ): Promise<any>;
  public getDeleteTxHash(mnemonic: string, fileid: string): Promise<any>;
}
