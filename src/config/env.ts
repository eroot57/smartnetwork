import { z } from 'zod';

// Environment variable schema definition
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  NEXT_PUBLIC_SOLANA_NETWORK: z.enum(['mainnet-beta', 'testnet', 'devnet']).default('devnet'),
  NEXT_PUBLIC_SOLANA_RPC_HOST: z.string().url().default('https://ellette-cyy4xd-fast-mainnet.helius-rpc.com'),
  NEXT_PUBLIC_CROSSMINT_API_URL: z.string().url().default('https://staging.crossmint.com/api/v1-alpha2'),
  NEXT_PUBLIC_JUPITER_API_URL: z.string().url().default('https://price.jup.ag/v4'),
  NEXT_PUBLIC_HELIUS_API_URL: z.string().url().default('https://api.helius.xyz/v0'),
  NEXT_PUBLIC_CROSSMINT_API_KEY: z.string().default('sk_production_246zDWhHtEpRCbfwjmXRVicTYvfs85PzDNYt8E27AHmM3oGGb9TiqUEe3sZDuM8DW3zKdJq49GsrvSm1GwaaziCyW4AWaXviBQK7M4dwhY1tKnuD2zLZh8DmVVbVfvX2LkkTF77AQx71hp7gGa4gLasxUak7QXrJjkZ8tTN6oGPZSwJnSLBrK75DddALoqTJKEkKpadg6VGatNhB245FT5f'),
  NEXT_PUBLIC_JUPITER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_HELIUS_API_KEY: z.string().default('66e1530d-f237-434f-8213-b3248a95318f'),
  NEXT_PUBLIC_FEATURE_AI: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_FEATURE_NFT: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_FEATURE_SWAP: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_FEATURE_STAKING: z.enum(['true', 'false']).default('true')
});

// Load and validate environment variables
export const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.format());
  console.error('Detailed error information:', env.error.issues);
  throw new Error('Invalid environment variables');
}

export const config = env.data;
