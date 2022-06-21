import ControlBase from "../control-base";

export class FileStorage extends ControlBase {
  constructor(config: any);
  public findPrice(): Promise<any>;
  public findPurchasedSpace(walletAddress: string): Promise<any>;
  public findFile(fileId: string): Promise<any>;
  public findFileList(walletAddress: string): Promise<any>;
  private findSchedulerIPs(onlyone: number): Promise<any>;
  public fileUpload(
    mnemonic: string,
    filePath: string,
    backups: number,
    downloadfee: number,
    privatekey: string
  ): Promise<any>;
  public fileDownload(
    fileId: string,
    fileSaveDir: string,
    privatekey: string
  ): Promise<any>;
  public expansion(
    mnemonic: string,
    spaceCount: number,
    leaseCount: number,
    maxPrice: number
  ): Promise<any>;
  private buySpace(
    mnemonic: string,
    spaceCount: number,
    leaseCount: number,
    maxPrice: number
  ): Promise<any>;
  public deleteFile(mnemonic: string, fileid: string): Promise<any>;
  public fileEncrypt(
    filePath: string,
    newFilePath: string,
    privatekey: string
  ): Promise<any>;
  public fileDecrypt(
    filePath: string,
    newFilePath: string,
    privatekey: string
  ): Promise<any>;
  public fileUploadWithTxHash(
    txHash,
    filePath,
    fileid,
    privatekey
  ): Promise<any>;
  public fileDeleteWithTxHash(txHash): Promise<any>;
  public expansionTxHash(txHash): Promise<any>;
}
