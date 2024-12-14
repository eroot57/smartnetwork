// src/components/wallet/WalletInfo.tsx
import { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useCompressedTokenBalance } from '@/hooks/useCompressedTokenBalance';
import { WalletContext } from '@/context/walletContext';
import { Loader } from '../ui/loader';
import { formatUtils } from '@/lib/utils/format';
import { Wallet, RefreshCw } from 'lucide-react';

export function WalletInfo() {
  const { publicKey } = useContext(WalletContext);
  const { balance: solBalance, isLoading: isLoadingSol } = useWalletBalance();
  const { compressedTokens, isLoading: isLoadingTokens } = useCompressedTokenBalance();

  const isLoading = isLoadingSol || isLoadingTokens;

  if (!publicKey) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  const totalCompressedTokens = compressedTokens?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* SOL Balance */}
          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">SOL Balance</p>
                <p className="text-2xl font-bold">{formatUtils.formatSOL(solBalance || 0)}</p>
              </div>
              <img src="/solana-logo.svg" alt="SOL" className="w-8 h-8" />
            </div>
          </div>

          {/* Compressed Tokens Summary */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Compressed Tokens</p>
                <p className="text-2xl font-bold">{totalCompressedTokens}</p>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">Wallet Address</p>
            <p className="font-mono text-sm break-all">{publicKey.toString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}