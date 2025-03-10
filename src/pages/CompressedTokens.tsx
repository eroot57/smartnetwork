import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { MintTokensModal } from "@/components/modals/MintTokensModal";
import { SendCompressedTokensModal } from "@/components/modals/SendCompressedTokensModal";
import { DecompressTokenModal } from "@/components/modals/DecompressTokenModal";
import { SendHorizontal, Coins, RefreshCcw } from "lucide-react";
import { useCompressedTokenBalance } from "@/hooks/useCompressedTokenBalance";
import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompressedTokenInfo } from "@/context/tokensContexts";

const CompressedTokens = () => {
  const navigate = useNavigate();
  const { publicKey: connectedWallet } = useWallet();
  const {
    compressedTokens: allCompressedTokens,
    isFetching: isFetchingCompressedTokens,
    error: errorFetchingCompressedTokens,
    refetch: refetchCompressedTokens,
  } = useCompressedTokenBalance();
  const [isMintingTokens, setIsMintingTokens] = useState(false);
  const [isSendingTokens, setIsSendingTokens] = useState(false);
  const [isDecompressingTokens, setIsDecompressingTokens] = useState(false);
  const [selectedToken, setSelectedToken] =
    useState<CompressedTokenInfo | null>(null);
  const [filteredTokens, setFilteredTokens] = useState<
    CompressedTokenInfo[] | null
  >([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search) {
        const filtered = allCompressedTokens?.filter((token) =>
          token.mint.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTokens(filtered);
      } else {
        setFilteredTokens(allCompressedTokens);
      }
    }, 10); // Adjust the delay as needed (500ms in this example)

    // Cleanup function to clear the timeout if search term changes
    return () => {
      clearTimeout(handler);
    };
  }, [search, allCompressedTokens]);

  const tokensToRender = search ? filteredTokens : allCompressedTokens;

  const goToMintDetail = (mint: string) => {
    navigate(`/mint/${mint}`);
  };

  if (!connectedWallet) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500 font-thin">
          Connect your wallet to view your compressed tokens
        </p>
      </div>
    );
  }

  if (isFetchingCompressedTokens) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">fetching compressed tokens...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center pb-5">
          <h1 className="text-4xl font-semibold text-gray-700">
            Compressed Wallet
          </h1>
          <button
            disabled={isFetchingCompressedTokens}
            onClick={refetchCompressedTokens}
            className="bg-gray-100 p-2 rounded-md hover:bg-white transition-colors"
          >
            <RotateCcw strokeWidth={1.25} size={20} />
          </button>
        </div>
        {errorFetchingCompressedTokens ? (
          <p className="text-red-500 font-light text-sm text-center">
            {errorFetchingCompressedTokens}
          </p>
        ) : (
          <div>
            <div className="pb-2">
              <input
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search for mint"
                className="w-full p-2 rounded-md bg-gray-100 focus:outline-black text-gray-600 font-light"
              />
            </div>
            <div className="grid grid-cols-[1fr_150px_300px] items-center gap-4 h-8 px-2 text-gray-700 font-semibold">
              <h3>Mint</h3>
              <h3 className="text-right">Balance</h3>
            </div>
            {tokensToRender?.map((token) => (
              <div
                className="grid grid-cols-[1fr_150px_300px] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-12 px-2 text-gray-500 font-light rounded"
                key={token.mint}
              >
                <div
                  onClick={() => {
                    goToMintDetail(token.mint);
                  }}
                  className="flex items-center"
                >
                  <p>{token.mint}</p>
                </div>
                <div
                  onClick={() => {
                    goToMintDetail(token.mint);
                  }}
                  className="flex items-center justify-end"
                >
                  <p>{token.balance}</p>
                </div>
                <div className="flex justify-end items-center gap-2">
                  <Button
                    className="bg-gray-500 h-7 font-light px-2"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsMintingTokens(true);
                    }}
                  >
                    Mint
                    <Coins className="ml-1" size={16} strokeWidth={1.25} />
                  </Button>
                  <Button
                    className="bg-gray-500 h-7 font-light px-2"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsSendingTokens(true);
                    }}
                  >
                    Send
                    <SendHorizontal
                      className="ml-1"
                      strokeWidth={1.25}
                      size={16}
                    />
                  </Button>
                  <Button
                    className="bg-gray-500 h-7 font-light px-2"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsDecompressingTokens(true);
                    }}
                  >
                    Decompress
                    <RefreshCcw className="ml-1" strokeWidth={1.25} size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MintTokensModal
        open={isMintingTokens}
        onClose={() => setIsMintingTokens(false)}
        mint={selectedToken?.mint}
      />
      <SendCompressedTokensModal
        open={isSendingTokens}
        onClose={() => setIsSendingTokens(false)}
        mint={selectedToken?.mint}
      />
      <DecompressTokenModal
        open={isDecompressingTokens}
        onClose={() => setIsDecompressingTokens(false)}
        mint={selectedToken?.mint}
      />
    </>
  );
};

export default CompressedTokens;
