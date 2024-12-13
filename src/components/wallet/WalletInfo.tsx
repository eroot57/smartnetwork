// src/components/wallet/WalletInfo.tsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, RefreshCw } from 'lucide-react';
import { useCrossmintWallet } from '@/hooks/useCrossmintWallet';

export function WalletInfo() {
  const { address, balance, isLoading, error, refreshBalance } = useCrossmintWallet();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Initializing wallet...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span>Solana Wallet</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold">{balance} SOL</p>
        </div>
      </CardContent>
    </Card>
  );
}