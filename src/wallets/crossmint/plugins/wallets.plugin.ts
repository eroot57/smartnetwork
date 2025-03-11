import type { CrossmintApiClient } from '@crossmint/common-sdk-base';
import { type Chain, PluginBase } from '@goat-sdk/core';
import type { EVMWalletClient } from '@goat-sdk/wallet-evm';
import { WalletsService } from './wallets.service';

export class WalletsPlugin extends PluginBase<EVMWalletClient> {
  constructor(client: CrossmintApiClient) {
    super('wallets', [new WalletsService(client)]);
  }

  supportsChain(_chain: Chain) {
    return true;
  }
}

export function walletsPlugin(client: CrossmintApiClient) {
  return () => {
    return new WalletsPlugin(client);
  };
}
