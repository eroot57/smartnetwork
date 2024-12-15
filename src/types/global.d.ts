// src/types/global.d.ts

declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SOLANA_NETWORK: 'mainnet' | 'devnet' | 'local'
      NEXT_PUBLIC_LOCAL_RPC_URL: string
      NEXT_PUBLIC_DEVNET_RPC_URL: string
      NEXT_PUBLIC_MAINNET_RPC_URL: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
  
  type APIResponse<T = unknown> = {
    success: boolean
    data: T
    error?: {
      code: string
      message: string
      details?: Record<string, unknown>
    }
  }
  
  type ErrorResponse = {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  
  interface TransactionError extends Error {
    code?: string
    data?: unknown
  }
  
  // Common types for wallet operations
  type WalletBalance = {
    amount: string
    currency: string
    usdValue?: number
  }
  
  type TokenBalance = {
    mint: string
    symbol: string
    decimals: number
    amount: string
    uiAmount: number
  }
  
  // AI types
  type AIAnalysis = {
    risk: number
    recommendation: string
    factors: string[]
    confidence: number
  }
  
  type AIContext = {
    walletState: WalletState
    marketData?: MarketData
    transactionHistory?: Transaction[]
  }
  
  // Transaction types
  type Transaction = {
    signature: string
    timestamp: number
    type: 'send' | 'receive' | 'swap'
    amount: number
    status: 'success' | 'pending' | 'error'
    to?: string
    from?: string
  }
  
  type MarketData = {
    price: number
    change24h: number
    volume24h: number
    marketCap: number
  }