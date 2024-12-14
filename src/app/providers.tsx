// src/app/providers.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { WalletState } from '@/types/wallet';
import { aiAgentService } from '@/lib/ai/agent-service';
import { crossmintService } from '@/services/crossmint';
import { heliusService } from '@/services/helius';

// Wallet Context
interface WalletContextType {
  walletState: WalletState;
  updateBalance: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// AI Context
interface AIContextType {
  isAnalyzing: boolean;
  lastAnalysis: any;
  analyzeTransaction: (amount: number, recipient: string) => Promise<void>;
  getMarketInsights: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

// Combined Providers Component
export function Providers({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: '',
    balance: '0',
    isLoading: false,
    error: null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

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
  }, []);

  const updateBalance = async () => {
    if (!walletState.address) return;

    setWalletState(prev => ({ ...prev, isLoading: true }));
    try {
      const balance = await crossmintService.getBalance(walletState.address);
      setWalletState(prev => ({
        ...prev,
        balance: balance.toString(),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch balance'
      }));
    }
  };

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isLoading: true }));
    try {
      const wallet = await crossmintService.createWallet();
      localStorage.setItem('walletAddress', wallet.address);
      
      setWalletState({
        address: wallet.address,
        balance: '0',
        isLoading: false,
        error: null
      });

      await updateBalance();
      await initializeServices(wallet.address);
    } catch (error) {
      setWalletState({
        address: '',
        balance: '0',
        isLoading: false,
        error: 'Failed to connect wallet'
      });
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('walletAddress');
    setWalletState({
      address: '',
      balance: '0',
      isLoading: false,
      error: null
    });
  };

  const initializeServices = async (address: string) => {
    // Initialize AI service
    await aiAgentService.initializeAgent({ walletState: {
        address, balance: '0',
        isLoading: false,
        error: null
    } });
    
    // Initialize price tracking
    await heliusService.subscribeToPriceUpdates([address], () => {
      updateBalance();
    });
  };

  const analyzeTransaction = async (amount: number, recipient: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await aiAgentService.analyzeTransaction(amount, recipient);
      setLastAnalysis(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMarketInsights = async () => {
    setIsAnalyzing(true);
    try {
      const insights = await aiAgentService.getMarketInsights();
      setLastAnalysis(insights);
    } catch (error) {
      console.error('Failed to get market insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletState,
        updateBalance,
        connectWallet,
        disconnectWallet
      }}
    >
      <AIContext.Provider
        value={{
          isAnalyzing,
          lastAnalysis,
          analyzeTransaction,
          getMarketInsights
        }}
      >
        {children}
      </AIContext.Provider>
    </WalletContext.Provider>
  );
}

// Custom hooks
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};