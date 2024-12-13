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
    signature: string | undefined;
    id: string;
    status: string;
    from: string;
    to: string;
    amount: string;
    currency: string;
    timestamp: string;
  }
  
  export interface WalletState {
    address: string;
    balance: string;
    isLoading: boolean;
    error: string | null;
  }