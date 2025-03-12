import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
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
import { CompressedTokenInfo, TokenContextProvider } from "@/context/tokensContexts";

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
    if (typeof window !== 'undefined') {
      const handler = setTimeout(() => {
        if (search) {
          const filtered = allCompressedTokens?.filter((token) =>
            token.mint.toLowerCase().includes(search.toLowerCase())
          );
          setFilteredTokens(filtered);
        } else {
          setFilteredTokens(allCompressedTokens);
        }
      }, 10);

      return () => {
        clearTimeout(handler);
      };
    }
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
      {/* Rest of your component */}
    </div>
  );
};

const App = () => (
  <TokenContextProvider>
    <Router>
      <CompressedTokens />
    </Router>
  </TokenContextProvider>
);

export default App;
