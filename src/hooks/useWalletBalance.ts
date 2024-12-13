// src/hooks/useCrossmintWallet.ts
import { useState, useEffect } from 'react';
import { crossmintService } from '@/services/crossmint';
import { WalletState } from '@/types/wallet';

export function useCrossmintWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: '',
    balance: '0',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      const wallet = await crossmintService.createWallet();
      const balance = await crossmintService.getBalance(wallet.address);
      
      setWalletState({
        address: wallet.address,
        balance: balance.balance,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
      }));
    }
  };

  const refreshBalance = async () => {
    if (!walletState.address) return;

    try {
      const balance = await crossmintService.getBalance(walletState.address);
      setWalletState(prev => ({
        ...prev,
        balance: balance.balance,
      }));
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      }));
    }
  };

  const sendTransaction = async (toAddress: string, amount: number) => {
    if (!walletState.address) throw new Error('Wallet not initialized');

    try {
      const transaction = await crossmintService.sendTransaction(
        walletState.address,
        toAddress,
        amount
      );
      await refreshBalance();
      return transaction;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Transaction failed');
    }
  };

  return {
    ...walletState,
    refreshBalance,
    sendTransaction,
  };
}