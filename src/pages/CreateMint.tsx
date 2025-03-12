import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useContext } from "react";
import { PublicKey } from "@solana/web3.js";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { WalletContext, WalletContextState } from '../context/walletContext';
import { MintCreatedModal } from "@/components/modals/MintCreatedSuccess";
import { useWallet } from "@solana/wallet-adapter-react";

type Props = {
  onSubmit?: () => void;
};

const CreateMint = ({ onSubmit }: Props) => {
  const { publicKey: connectedWallet } = useWallet();
  const { toast } = useToast();
  const { createMint } = useContext(WalletContext) as WalletContextState;
  const [authority, setAuthority] = useState(connectedWallet?.toBase58() || "");
  const [decimals, setDecimals] = useState<number>(9);
  const [isCreating, setIsCreating] = useState(false);
  const [newMintAddress, setNewMintAddress] = useState<string | null>(null);

  const canSend = !!authority && decimals > 0;

  const handleCreateMint = async () => {
    if (!canSend) return;
    try {
      setIsCreating(true);
      const newMint = await createMint();
      const newMintAddress = newMint.toBase58();
      setNewMintAddress(newMintAddress);
      onSubmit?.();
      toast({
        title: "Success",
        description: "Mint created successfully",
        variant: "default",
      });
    } catch (error: any) {
      const isInsufficientBalance = error?.message
        ?.toLowerCase()
        .includes("not enough balance");
      
      toast({
        title: isInsufficientBalance ? "Insufficient balance" : "Error",
        description: isInsufficientBalance 
          ? "You do not have enough balance to create mint" 
          : "An error occurred while creating mint",
        variant: "destructive",
      });
      console.error('Failed to create mint:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!connectedWallet) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500 font-thin">
          Connect your wallet to create a mint
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="max-w-md flex-1">
          <h1 className="text-4xl font-semibold text-gray-700 pb-7 w-full">
            Create Mint
          </h1>
          <div className="pb-5 space-y-4">
            <div>
              <Label>Decimals</Label>
              <Input
                className="w-full"
                disabled={isCreating}
                type="number"
                placeholder="9"
                value={decimals}
                min={0}
                max={9}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 0 && value <= 9) {
                    setDecimals(value);
                  }
                }}
              />
            </div>
            <div>
              <Label>Authority</Label>
              <Input
                disabled={isCreating}
                type="text"
                placeholder="0xqwerty..."
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
              />
            </div>
          </div>
          {isCreating ? (
            <div className="flex justify-center h-9 items-center">
              <Loader className="w-5" />
            </div>
          ) : (
            <Button
              className="w-full bg-gray-700 hover:bg-gray-600"
              disabled={!canSend}
              onClick={handleCreateMint}
            >
              Create Mint
            </Button>
          )}
        </div>
      </div>
      <MintCreatedModal
        isOpen={!!newMintAddress}
        onClose={() => setNewMintAddress(null)}
        mintAddress={newMintAddress || ""}
      />
    </>
  );
};

export default CreateMint;