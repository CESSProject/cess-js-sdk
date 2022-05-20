
export class MyKeyring extends Keyring {
  constructor(config: any);
  protected getPublicKeyFromMnemonic(mnemonic: string): string;
  protected getPublicKeyFromAccountId(accountId: string): string;
}
