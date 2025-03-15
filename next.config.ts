import { config } from 'dotenv';
import { NextConfig } from 'next';

// Load environment variables from .env file
config();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
    NEXT_PUBLIC_SOLANA_RPC_HOST: process.env.NEXT_PUBLIC_SOLANA_RPC_HOST,
    NEXT_PUBLIC_CROSSMINT_API_URL: process.env.NEXT_PUBLIC_CROSSMINT_API_URL,
    NEXT_PUBLIC_JUPITER_API_URL: process.env.NEXT_PUBLIC_JUPITER_API_URL,
    NEXT_PUBLIC_HELIUS_API_URL: process.env.NEXT_PUBLIC_HELIUS_API_URL,
    NEXT_PUBLIC_CROSSMINT_API_KEY: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY,
    NEXT_PUBLIC_JUPITER_API_KEY: process.env.NEXT_PUBLIC_JUPITER_API_KEY,
    NEXT_PUBLIC_HELIUS_API_KEY: process.env.NEXT_PUBLIC_HELIUS_API_KEY,
    NEXT_PUBLIC_FEATURE_AI: process.env.NEXT_PUBLIC_FEATURE_AI,
    NEXT_PUBLIC_FEATURE_NFT: process.env.NEXT_PUBLIC_FEATURE_NFT,
    NEXT_PUBLIC_FEATURE_SWAP: process.env.NEXT_PUBLIC_FEATURE_SWAP,
    NEXT_PUBLIC_FEATURE_STAKING: process.env.NEXT_PUBLIC_FEATURE_STAKING,
  },
  reactStrictMode: true,
  eslint: {
    // Only run ESLint on specific commands
    ignoreDuringBuilds: process.env.DISABLE_ESLINT_PLUGIN === 'true',
  },
  typescript: {
    // Allow production builds with type issues during development
    ignoreBuildErrors: process.env.DISABLE_ESLINT_PLUGIN === 'true',
  }
};

export default nextConfig;
