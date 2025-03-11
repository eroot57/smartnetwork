import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TokenAccount } from '@/utils/solana';
import type { FC } from 'react';

export interface ReclaimModalProps {
  open: boolean;
  onClose: () => void;
  tokenAccount: TokenAccount;
}

const ReclaimModal: FC<ReclaimModalProps> = ({ open, onClose, tokenAccount }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reclaim Rent</DialogTitle>
        </DialogHeader>
        <div>
          <p>Token Mint: {tokenAccount.mint}</p>
          <p>Amount: {tokenAccount.amount}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReclaimModal;
