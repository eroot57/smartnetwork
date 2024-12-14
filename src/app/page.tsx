// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { AIAssistant } from '@/components/wallet/AIAssistant';
import { SendTransaction } from '@/components/wallet/SendTransaction';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { TokenManager } from '@/components/wallet/TokenManager';
//import { NFTGallery } from '@/components/wallet/NFTGallery';
import { Settings } from '@/components/wallet/WalletSettings';
import { PortfolioAnalytics } from '@/components/wallet/PortfolioAnalytics';
import { useWallet } from './providers';

export default function Home() {
  const { walletState, connectWallet } = useWallet();

  useEffect(() => {
    if (!walletState.address) {
      connectWallet();
    }
  }, []);

  if (walletState.isLoading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!walletState.address) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to AI-Powered Solana Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to continue</p>
          <button
            onClick={() => connectWallet()}
            className="button-primary"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-padding py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <WalletInfo />
          <SendTransaction />
          <Settings />
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioAnalytics />
          <AIAssistant walletState={walletState} />
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="mt-8 space-y-6">
        <TokenManager walletState={walletState} />
        <TransactionHistory walletState={walletState} />
        
      </div>
    </div>
  );
}