// src/hooks/useTransactions.ts
import { useState, useCallback } from 'react';
import { crossmintService } from '@/services/crossmint';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  error?: string;
}

interface TransactionFilters {
  type?: 'incoming' | 'outgoing';
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionStats {
  totalVolume: number;
  averageAmount: number;
  largestTransaction: number;
  totalIncoming: number;
  totalOutgoing: number;
  successRate: number;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  stats: TransactionStats;
  isLoading: boolean;
  error: string | null;
  sendTransaction: (to: string, amount: number) => Promise<Transaction>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  getTransactionStatus: (txId: string) => Promise<string>;
  calculateStats: (transactions: Transaction[]) => TransactionStats;
  filterTransactions: (filters: TransactionFilters) => Transaction[];
}

export function useTransactions(walletAddress: string): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TransactionStats>({
    totalVolume: 0,
    averageAmount: 0,
    largestTransaction: 0,
    totalIncoming: 0,
    totalOutgoing: 0,
    successRate: 0,
  });

  const calculateStats = useCallback((txs: Transaction[]): TransactionStats => {
    const confirmedTxs = txs.filter(tx => tx.status === 'confirmed');
    const totalTxs = txs.length;
    
    const amounts = confirmedTxs.map(tx => parseFloat(tx.amount));
    const incomingAmounts = confirmedTxs
      .filter(tx => tx.type === 'incoming')
      .map(tx => parseFloat(tx.amount));
    const outgoingAmounts = confirmedTxs
      .filter(tx => tx.type === 'outgoing')
      .map(tx => parseFloat(tx.amount));

    const totalVolume = amounts.reduce((sum, amount) => sum + amount, 0);
    const averageAmount = totalVolume / amounts.length || 0;
    const largestTransaction = Math.max(...amounts, 0);
    const totalIncoming = incomingAmounts.reduce((sum, amount) => sum + amount, 0);
    const totalOutgoing = outgoingAmounts.reduce((sum, amount) => sum + amount, 0);
    const successRate = (confirmedTxs.length / totalTxs) * 100 || 0;

    return {
      totalVolume,
      averageAmount,
      largestTransaction,
      totalIncoming,
      totalOutgoing,
      successRate,
    };
  }, []);

  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch transactions from Crossmint service
      const response: Transaction[] = await crossmintService.getTransactions(walletAddress);
      
      // Format transactions
      const formattedTxs: Transaction[] = response.map((tx: any) => ({
        id: tx.id,
        type: tx.fromAddress === walletAddress ? 'outgoing' : 'incoming',
        amount: tx.amount,
        from: tx.fromAddress,
        to: tx.toAddress,
        timestamp: new Date(tx.timestamp),
        status: tx.status,
        signature: tx.signature,
      }));

      // Apply filters if provided
      const filteredTxs = filters ? filterTransactions(formattedTxs, filters) : formattedTxs;
      
      setTransactions(filteredTxs);
      setStats(calculateStats(filteredTxs));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, calculateStats]);

  const filterTransactions = useCallback((txs: Transaction[], filters: TransactionFilters): Transaction[] => {
    return txs.filter(tx => {
      if (filters.type && tx.type !== filters.type) return false;
      
      if (filters.startDate && tx.timestamp < filters.startDate) return false;
      if (filters.endDate && tx.timestamp > filters.endDate) return false;
      
      const amount = parseFloat(tx.amount);
      if (filters.minAmount && amount < filters.minAmount) return false;
      if (filters.maxAmount && amount > filters.maxAmount) return false;
      
      return true;
    });
  }, []);

  const sendTransaction = useCallback(async (to: string, amount: number): Promise<Transaction> => {
    setError(null);

    try {
      const response = await crossmintService.sendTransaction(walletAddress, to, amount);
      
      const newTransaction: Transaction = {
        id: response.id,
        type: 'outgoing',
        amount: amount.toString(),
        from: walletAddress,
        to,
        timestamp: new Date(),
        status: 'pending',
        signature: response.signature,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      // Start polling for transaction status
      pollTransactionStatus(newTransaction.id);

      return newTransaction;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Transaction failed';
      setError(error);
      throw new Error(error);
    }
  }, [walletAddress]);

  const getTransactionStatus = useCallback(async (txId: string): Promise<string> => {
    try {
      const status = await crossmintService.getTransactionStatus(txId);
      
      // Update transaction status in state
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === txId ? { ...tx, status: status as unknown as 'confirmed' | 'pending' | 'failed' } : tx
        )
      );

      return status as unknown as string;
    } catch (err) {
      console.error('Error fetching transaction status:', err);
      return 'failed';
    }
  }, []);

  const pollTransactionStatus = useCallback(async (txId: string) => {
    const pollInterval = setInterval(async () => {
      const status = await getTransactionStatus(txId);
      
      if (status === 'confirmed' || status === 'failed') {
        clearInterval(pollInterval);
        
        // Update stats after transaction confirmation
        setStats(prevStats => calculateStats([...transactions]));
      }
    }, 2000); // Poll every 2 seconds

    // Clear interval after 2 minutes (max polling time)
    setTimeout(() => clearInterval(pollInterval), 120000);
  }, [getTransactionStatus, transactions, calculateStats]);

  return {
    transactions,
    stats,
    isLoading,
    error,
    sendTransaction,
    fetchTransactions,
    getTransactionStatus,
    calculateStats,
    filterTransactions: (filters: TransactionFilters) => filterTransactions(transactions, filters),
  };
}