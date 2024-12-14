// src/types/wallet.ts
export interface WalletResponse {
    address: string;
    type: string;
    status: string;
  }
  
  export interface BalanceResponse {
    balance: string;
    currency: string;
  }
  
  export interface TransactionResponse {
    id: string;
    amount: string;
    fromAddress: string;
    toAddress: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
    signature?: string;
  }
  
  export interface WalletState {
    address: string;
    balance: string;
    isLoading: boolean;
    error: string | null;
  }

  export interface TokenBalance {
    mint: string;
    amount: string;
    decimals: number;
    symbol: string;
    name: string;
    logoURI?: string;
    priceData?: {
      price: number;
      change24h: number;
    };
  }
  
  export interface WalletBalance {
    amount: string;
    usdValue?: number;
  }