import { useTokens } from '@/context/tokensContexts';
import { getSolBalance } from '@/utils/solana';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Token = {
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
};

type UseSolBalanceHook = {
  solBalance: number;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
  tokens: Token[]; // Add tokens property
  loading: boolean; // Add loading property
};

export const useSolBalance = (): UseSolBalanceHook => {
  const { publicKey: connectedWallet } = useWallet();
  const { connection } = useConnection();
  const { solBalance, setSolBalance } = useTokens();
  const hasFetchedRef = useRef(false);
  const [isFetching, _setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, _setTokens] = useState<Token[]>([]); // Add tokens state
  const [loading, setLoading] = useState(false); // Add loading state

  const fetchWalletSolBalance = useCallback(async () => {
    if (!connectedWallet) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balance = await getSolBalance(connection, connectedWallet);
      setSolBalance(balance);
      // Fetch tokens here if needed and setTokens
    } catch (_err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [connectedWallet, connection, setSolBalance]);

  useEffect(() => {
    if (connectedWallet && !hasFetchedRef.current) {
      fetchWalletSolBalance();
      hasFetchedRef.current = true;
    }
  }, [connectedWallet, fetchWalletSolBalance]);

  return {
    solBalance,
    isFetching,
    error,
    refetch: fetchWalletSolBalance,
    tokens, // Return tokens
    loading, // Return loading
  };
};
