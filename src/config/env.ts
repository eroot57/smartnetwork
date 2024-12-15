import { z } from 'zod';

// Environment variable schema definition
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Solana network configuration
  NEXT_PUBLIC_SOLANA_NETWORK: z.enum(['mainnet-beta', 'testnet', 'devnet']).default('devnet'),
  NEXT_PUBLIC_SOLANA_RPC_HOST: z.string().url(),

  // API endpoints
  NEXT_PUBLIC_CROSSMINT_API_URL: z.string().url().default('https://staging.crossmint.com/api/v1-alpha2'),
  NEXT_PUBLIC_JUPITER_API_URL: z.string().url().default('https://price.jup.ag/v4'),
  NEXT_PUBLIC_HELIUS_API_URL: z.string().url().default('https://api.helius.xyz/v0'),

  // API keys
  NEXT_PUBLIC_CROSSMINT_API_KEY: z.string().min(1),
  NEXT_PUBLIC_JUPITER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_HELIUS_API_KEY: z.string().min(1),

  // Feature flags
  NEXT_PUBLIC_FEATURE_AI: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_FEATURE_NFT: z.enum(['true', 'false']).default('true'),
});

// Load and validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Environment configuration validation failed', env.error.errors);
  throw new Error('Environment configuration validation failed');
}

export const config = env.data;