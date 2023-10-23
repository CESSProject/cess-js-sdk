/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: There are a few types that I don't know the return types. So enable the use of
// `any` for now.

import { ApiPromise, Keyring } from "@polkadot/api";

export as namespace CESS;
export = CESS;

interface APIReturnedData {
  msg: string;
  data?: any;
  errMsg?: string;
  error?: string;
}

interface KeyringOption {
  type: string;
  ss58Format: number;
}

declare namespace CESS {
  interface CESSConfig {
    nodeURL: string;
    gatewayURL: string;
    keyringOption: KeyringOption;
  }

  interface SpaceInfo {
    totalSpace?: number;
    usedSpace?: number;
    lockedSpace?: number;
    remainingSpace?: number;
    deadline?: number;
  }

  interface SpaceInfoFormatted extends SpaceInfo {
    totalSpaceGib?: number;
    totalSpaceStr?: string;

    usedSpaceGib?: number;
    usedSpaceStr?: string;

    lockedSpaceGib?: number;
    lockedSpaceStr?: string;

    remainingSpaceGib?: number;
    remainingSpaceStr?: string;

    deadlineTime?: string;
    remainingDays?: number;
  }

  function InitAPI(config: CESSConfig): Promise<{
    api: ApiPromise;
    keyring: Keyring;
  }>;

  class ControlBase {
    constructor(api: ApiPromise, keyring: Keyring, isDebug?: boolean);
    log(...msgs: string[]): void;
    error(...msgs: string[]): void;
    sign(mnemonic: string, tx: object): Promise<string>;
    submitTransaction(transaction: object): Promise<string>;
    signAndSend(mnemonic: string, extrinsic: object): Promise<any>;
    signAndSendWeb3(accountId32: string, extrinsic: object): Promise<any>;
    authSign(mnemonic: string, msg: string): Promise<any>;
    formatAccountId(accountId32: string | undefined): string | undefined;
  }

  class Common extends ControlBase {
    constructor(api: ApiPromise, keyring: Keyring, isDebug?: boolean);
    queryBlockHeight(): Promise<number>;
    formatSpaceInfo(spaceInfo: SpaceInfo | undefined, blockHeight: number): SpaceInfoFormatted;
  }

  class Space extends ControlBase {
    constructor(api: ApiPromise, keyring: Keyring, isDebug?: boolean);
    userOwnedSpace(accountId32: string): Promise<APIReturnedData>;
    buySpace(mnemonic: string, gibCount: number): Promise<any>;
    expansionSpace(mnemonicOrAccountId32: string, gibCount: number): Promise<any>;
    renewalSpace(mnemonic: string, days: number): Promise<any>;
  }

  class Authorize extends ControlBase {
    constructor(api: ApiPromise, keyring: Keyring, isDebug?: boolean);
    authorityList(accountId32: string): Promise<APIReturnedData>;
    authorize(mnemonic: string, operator: string): Promise<any>;
    cancelAuthorize(mnemonic: string, operator: string): Promise<any>;
  }

  class Bucket extends ControlBase {
    constructor(api: ApiPromise, keyring: Keyring, isDebug?: boolean);
    queryBucketNames(accountId32: string): Promise<APIReturnedData>;
    queryBucketList(accountId32: string): Promise<APIReturnedData>;
    queryBucketInfo(accountId32: string, name: string): Promise<APIReturnedData>;
    createBucket(mnemonic: string, accountId32: string, name: string): Promise<any>;
    deleteBucket(mnemonic: string, accountId32: string, name: string): Promise<any>;
  }

  class File extends ControlBase {
    constructor(api: ApiPromise, keyring: Keyring, gatewayURL: string, isDebug?: boolean);
    queryFileListFull(accountId32: string): Promise<APIReturnedData>;
    queryFileList(accountId32: string): Promise<APIReturnedData>;
    queryFileMetadata(fileHash: string): Promise<APIReturnedData>;
    uploadFile(
      mnemonic: string,
      accountId32: string,
      filePath: string,
      bucketName: string,
    ): Promise<any>;
    downloadFile(fileHash: string, savePath: string): Promise<any>;
    deleteFile(mnemonic: string, accountId32: string, fileHashArray: string[]): Promise<any>;
  }

  function buildConfig(
    nodeURL: string,
    gatewayURL: string,
    keyringOption?: KeyringOption,
  ): CESSConfig;

  const testnetConfig: CESSConfig;

  const wellKnownAcct: {
    addr: string;
    mnemonic: string;
    gatewayAddr: string;
  };
}
