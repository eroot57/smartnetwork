// src/app/page.tsx
// src/app/page.tsx
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { AIAssistant } from '@/components/wallet/AIAssistant';
import { SendTransaction } from '@/components/wallet/SendTransaction';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { TokenManager } from '@/components/wallet/TokenManager';
import { useCrossmintWallet } from '@/hooks/useCrossmintWallet';

export default function WalletPage() {
  const walletState = useCrossmintWallet();

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <WalletInfo />
            <SendTransaction />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <TokenManager walletState={walletState} />
          <AIAssistant walletState={walletState} />
          <TransactionHistory walletState={walletState} />
        </div>
      </div>
    </div>
  );
}