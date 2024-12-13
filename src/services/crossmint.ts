// src/services/crossmint.ts
import { WalletResponse, BalanceResponse, TransactionResponse } from '@/types/wallet';

const CROSSMINT_API_URL = 'https://staging.crossmint.com/api/v1-alpha2';

class CrossmintService {
  getTransactions(walletAddress: string) {
      throw new Error('Method not implemented.');
  }
  getTransactionStatus(txId: string) {
      throw new Error('Method not implemented.');
  }
  private apiKey: string;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY;
    if (!apiKey) {
      throw new Error('CROSSMINT_API_KEY is not defined in environment variables');
    }
    this.apiKey = apiKey;
  }

  private async fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${CROSSMINT_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async createWallet(): Promise<WalletResponse> {
    return this.fetchApi<WalletResponse>('/wallets', {
      method: 'POST',
      body: JSON.stringify({
        type: 'solana-custodial-wallet',
      }),
    });
  }

  async getBalance(walletAddress: string): Promise<BalanceResponse> {
    return this.fetchApi<BalanceResponse>(
      `/wallets/${walletAddress}/balances?currency=sol`
    );
  }

  async sendTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<TransactionResponse> {
    return this.fetchApi<TransactionResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        from: fromAddress,
        to: toAddress,
        amount: amount.toString(),
        currency: 'sol',
      }),
    });
  }
}

export const crossmintService = new CrossmintService();