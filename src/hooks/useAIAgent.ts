// src/hooks/useAIAgent.ts
import { useState, useEffect } from 'react';
import { walletAI, AIResponse } from '@/lib/ai/agent';
import { WalletState } from '@/types/wallet';

interface AIAgentHook {
  isThinking: boolean;
  lastResponse: AIResponse | null;
  askAI: (query: string) => Promise<AIResponse>;
  evaluateTransaction: (toAddress: string, amount: number, purpose?: string) => Promise<AIResponse>;
  error: string | null;
}

export function useAIAgent(walletState: WalletState): AIAgentHook {
  const [isThinking, setIsThinking] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update AI context when wallet state changes
  useEffect(() => {
    walletAI.updateContext(walletState);
  }, [walletState]);

  const askAI = async (query: string): Promise<AIResponse> => {
    setIsThinking(true);
    setError(null);
    
    try {
      const response = await walletAI.analyze(query);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsThinking(false);
    }
  };

  const evaluateTransaction = async (
    toAddress: string,
    amount: number,
    purpose?: string
  ): Promise<AIResponse> => {
    setIsThinking(true);
    setError(null);

    try {
      const response = await walletAI.evaluateTransaction(toAddress, amount, purpose);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setIsThinking(false);
    }
  };

  return {
    isThinking,
    lastResponse,
    askAI,
    evaluateTransaction,
    error
  };
}