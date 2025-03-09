import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { aiAgentService } from '@/lib/ai/agent-service';
import { crossmintService } from '@/services/crossmint';
import { heliusService } from '@/services/helius';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

// Update Props type to avoid empty object
interface ProviderProps {
  children: ReactNode;
}

// Wallet Context
interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
  select: (walletName: string) => void;
  createMint: (decimals?: number, authority?: string) => Promise<PublicKey>;
  balance?: string;
  error?: string | null;
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  connected: false,
  connecting: false,
  disconnect: async () => {},
  connect: async () => {},
  select: () => {},
  createMint: async () => {
    throw new Error('Not implemented');
  }
});

// AI Context
interface AIContextType {
  isAnalyzing: boolean;
  lastAnalysis: {
    risk?: number;
    recommendation?: string;
    details?: string[];
  } | null;
  analyzeTransaction: (amount: number, recipient: string) => Promise<void>;
  getMarketInsights: () => Promise<void>;
}

const AIContext = createContext<AIContextType>({
  isAnalyzing: false,
  lastAnalysis: null,
  analyzeTransaction: async () => {},
  getMarketInsights: async () => {}
});

interface AIAnalysis {
  type: 'success' | 'warning' | 'error';
  message: string;
  analysis: {
    risk?: number;
    factors?: string[];
    suggestion?: string;
  };
}

interface MarketAnalysis {
  trend: string;
  analysis: {
    summary: string;
    details: string[];
    recommendations: string[];
  };
}

export function Providers({ children }: ProviderProps) {
  const [walletState, setWalletState] = useState<WalletContextType>({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: async () => {},
    connect: async () => {},
    select: () => {},
    createMint: async () => {
      throw new Error('Not implemented');
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIContextType['lastAnalysis']>(null);

  const updateBalance = useCallback(async () => {
    if (!walletState.publicKey) return;

    setWalletState(prev => ({ ...prev, connecting: true }));
    try {
      const balance = await crossmintService.getBalance(walletState.publicKey.toString());
      setWalletState(prev => ({
        ...prev,
        balance: balance.toString(),
        connecting: false,
        error: null
      }));
    } catch (_error) { // Use underscore to indicate unused variable
      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: 'Failed to fetch balance'
      }));
    }
  }, [walletState.publicKey]);

  const disconnectWallet = useCallback(async () => {
    localStorage.removeItem('walletAddress');
    setWalletState(prev => ({
      ...prev,
      publicKey: null,
      connected: false,
      connecting: false
    }));
  }, []);

  const selectWallet = useCallback((_walletName: string) => {
    // Implementation will be added later
  }, []);

  const createMint = useCallback(async (decimals = 0, authority?: string): Promise<PublicKey> => {
    if (!walletState.publicKey) {
      throw new Error('Wallet not connected');
    }
    const mint = await crossmintService.createMint({
      decimals,
      authority: authority || walletState.publicKey.toString()
    });
    return new PublicKey(mint.address);
  }, [walletState.publicKey]);

  const initializeServices = useCallback(async (publicKey: PublicKey) => {
    await aiAgentService.initializeAgent({
      walletState: {
        address: publicKey.toString(),
        balance: walletState.balance || '',
        isLoading: walletState.connecting,
        error: walletState.error || null,
        publicKey: null,
        connected: false,
        connecting: false
      }
    });
    
    await heliusService.subscribeToPriceUpdates([publicKey.toString()], updateBalance);
  }, [walletState.balance, walletState.connecting, walletState.error, updateBalance]);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, connecting: true }));
    try {
      const wallet = await crossmintService.createWallet();
      localStorage.setItem('walletAddress', wallet.address);
      
      const publicKey = new PublicKey(wallet.address);
      setWalletState(prev => ({
        ...prev,
        publicKey,
        connected: true,
        connecting: false,
        connect: connectWallet,
        disconnect: disconnectWallet,
        select: selectWallet,
        createMint
      }));

      await updateBalance();
      await initializeServices(publicKey);
    } catch (_error) {
      setWalletState(prev => ({
        ...prev,
        publicKey: null,
        connected: false,
        connecting: false,
        error: 'Failed to connect wallet'
      }));
    }
  }, [createMint, disconnectWallet, selectWallet, updateBalance, initializeServices]);

  const analyzeTransaction = useCallback(async (amount: number, recipient: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await aiAgentService.analyzeTransaction(amount, recipient, 'Transaction purpose');
      setLastAnalysis({
        risk: analysis.analysis?.risk,
        recommendation: analysis.analysis?.suggestion,
        details: analysis.analysis?.factors || []
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getMarketInsights = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const insights = await aiAgentService.getMarketInsights();
      setLastAnalysis({
        recommendation: insights.analysis.recommendation,
        details: insights.analysis.factors || []
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const initializeWallet = async () => {
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        try {
          await connectWallet();
        } catch (error) {
          console.error('Failed to reconnect wallet:', error);
        }
      }
    };

    initializeWallet();
  }, [connectWallet]);

  return (
    <ErrorBoundary>
      <WalletContext.Provider value={walletState}>
        <AIContext.Provider
          value={{
            isAnalyzing,
            lastAnalysis,
            analyzeTransaction,
            getMarketInsights
          }}
        >
          {children}
          <Toaster />
        </AIContext.Provider>
      </WalletContext.Provider>
    </ErrorBoundary>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};