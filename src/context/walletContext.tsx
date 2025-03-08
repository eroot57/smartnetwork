import React, { createContext, useCallback, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { createMint as createSplMint } from '@solana/spl-token';

// Define context state interface
export interface WalletContextState {
  publicKey: PublicKey | null;
  createMint: (decimals: number, authority: string) => Promise<PublicKey>;
  // Add other methods as needed
}

// Create context with default undefined value
export const WalletContext = createContext<WalletContextState | undefined>(undefined);

// Provider props interface
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const createMint = useCallback(
    async (decimals: number, authorityString: string): Promise<PublicKey> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
        // Convert authority string to PublicKey
        const authorityPublicKey = new PublicKey(authorityString);
        
        // Create a new keypair for the mint
        const mintKeypair = Keypair.generate();
        
        // Create the mint
        return await createSplMint(
          connection,
          {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            sendTransaction: wallet.sendTransaction,
          },
          wallet.publicKey, // payer
          authorityPublicKey, // mint authority
          authorityPublicKey, // freeze authority (can be null)
          decimals,
          mintKeypair
        );
      } catch (error) {
        console.error('Error creating mint:', error);
        throw error;
      }
    },
    [connection, wallet]
  );

  const value = {
    createMint,
    // Add other methods as needed
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
