import type { PublicKey } from '@solana/web3.js';
import type React from 'react';
import { createContext, useMemo } from 'react';

export interface WalletContextState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect(): Promise<void>;
  connect(): Promise<void>;
  select(walletName: string): void;
  createMint(decimals?: number, authority?: string): Promise<PublicKey>; // Update createMint method
}

export const WalletContext = createContext<WalletContextState>({
  publicKey: null,
  connected: false,
  connecting: false,
  disconnect: async () => {},
  connect: async () => {},
  select: () => {},
  createMint: async () => {
    throw new Error('createMint not implemented'); // Update default implementation
  },
});

function getRpcUrl() {
  // Define your RPC URL here
  return 'https://api.testnet.solana.com';
}
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Testnet;
  const endpoint = useMemo(() => getRpcUrl(), [getRpcUrl]);
  const wallets = useMemo(
    () => [
      // manually add any legacy wallet adapters here
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
