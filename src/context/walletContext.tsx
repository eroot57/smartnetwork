import React, { createContext, useCallback, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Keypair, 
  Connection, 
  Transaction,
  SystemProgram
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction
} from '@solana/spl-token';

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
        
        // Since we can't use wallet as a Signer directly (no secretKey),
        // we need to create the mint differently
        
        // Generate transaction for creating the token mint
        const lamports = await connection.getMinimumBalanceForRentExemption(82);
        
        // Create instructions for the transaction
        const createAccountInstruction = SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        });
        
        const initializeMintInstruction = createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          authorityPublicKey,
          authorityPublicKey,
          TOKEN_PROGRAM_ID
        );
        
        // Create transaction
        const transaction = new Transaction().add(
          createAccountInstruction,
          initializeMintInstruction
        );
        
        // Sign and send transaction
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
        
        // The mint keypair needs to sign
        transaction.partialSign(mintKeypair);
        
        // The wallet needs to sign
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // Send the signed transaction
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature);
        
        return mintKeypair.publicKey;
      } catch (error) {
        console.error('Error creating mint:', error);
        throw error;
      }
    },
    [connection, wallet]
  );

  const value = {
    publicKey: wallet.publicKey,
    createMint,
    // Add other methods as needed
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
