// src/components/wallet/SendTransaction.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Loader2, ArrowRight } from 'lucide-react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { useCrossmintWallet } from '@/hooks/useCrossmintWallet';

interface TransactionFormData {
  recipient: string;
  amount: string;
  purpose: string;
}

interface TransactionStatus {
  status: 'idle' | 'validating' | 'sending' | 'success' | 'error';
  message: string;
}

export function SendTransaction() {
  const [formData, setFormData] = useState<TransactionFormData>({
    recipient: '',
    amount: '',
    purpose: ''
  });

  const [status, setStatus] = useState<TransactionStatus>({
    status: 'idle',
    message: ''
  });

  const { sendTransaction, balance } = useCrossmintWallet();
  const { evaluateTransaction, isThinking } = useAIAgent({
    balance,
    address: '', // This will be filled from wallet context
    isLoading: false,
    error: null
  });

  const validateSolanaAddress = (address: string): boolean => {
    // Basic Solana address validation (should be 32-44 characters)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset status when user is typing
    if (status.status !== 'idle') {
      setStatus({ status: 'idle', message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!validateSolanaAddress(formData.recipient)) {
      setStatus({
        status: 'error',
        message: 'Invalid Solana address format'
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setStatus({
        status: 'error',
        message: 'Invalid amount'
      });
      return;
    }

    // Check if user has sufficient balance
    if (amount > parseFloat(balance)) {
      setStatus({
        status: 'error',
        message: 'Insufficient balance'
      });
      return;
    }

    try {
      // First, get AI evaluation
      setStatus({
        status: 'validating',
        message: 'Evaluating transaction safety...'
      });

      const aiEvaluation = await evaluateTransaction(
        formData.recipient,
        amount,
        formData.purpose
      );

      if (aiEvaluation.action === 'REJECT_TRANSACTION') {
        setStatus({
          status: 'error',
          message: `AI Safety Check: ${aiEvaluation.content}`
        });
        return;
      }

      // Proceed with transaction
      setStatus({
        status: 'sending',
        message: 'Sending transaction...'
      });

      await sendTransaction(formData.recipient, amount);

      setStatus({
        status: 'success',
        message: 'Transaction sent successfully!'
      });

      // Reset form
      setFormData({
        recipient: '',
        amount: '',
        purpose: ''
      });

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus({
          status: 'idle',
          message: ''
        });
      }, 5000);

    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Transaction failed'
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send SOL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="Solana address"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={status.status === 'sending' || status.status === 'validating'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (SOL)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.0"
              step="0.000000001"
              min="0"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={status.status === 'sending' || status.status === 'validating'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose (optional)
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="What's this transaction for?"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={status.status === 'sending' || status.status === 'validating'}
            />
          </div>

          {status.message && (
            <Alert variant={status.status === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            disabled={
              status.status === 'sending' || 
              status.status === 'validating' ||
              isThinking
            }
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {status.status === 'sending' && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {status.status === 'validating' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating
              </>
            ) : (
              <>
                Send
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}