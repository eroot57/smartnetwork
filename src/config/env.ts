// src/config/env.ts
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
  NEXT_PUBLIC_FEATURE_SWAP: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_FEATURE_STAKING: z.enum(['true', 'false']).default('true'),

  // AI Configuration
  NEXT_PUBLIC_AI_MODEL: z.enum(['gpt-4', 'gpt-3.5-turbo']).default('gpt-4'),
  NEXT_PUBLIC_AI_MAX_TOKENS: z.string().transform(Number).default('1000'),

  // Transaction settings
  NEXT_PUBLIC_MAX_TRANSACTION_AMOUNT: z.string().transform(Number).default('1000'),
  NEXT_PUBLIC_DEFAULT_SLIPPAGE: z.string().transform(Number).default('0.5')
});

// Env variable types
type EnvSchema = z.infer<typeof envSchema>;

// Configuration class
class Environment {
  private static instance: Environment;
  private config: EnvSchema;
  private errors: string[] = [];

  private constructor() {
    try {
      // Validate and parse environment variables
      this.config = envSchema.parse({
        NODE_ENV: process.env.NODE_ENV,
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
        NEXT_PUBLIC_AI_MODEL: process.env.NEXT_PUBLIC_AI_MODEL,
        NEXT_PUBLIC_AI_MAX_TOKENS: process.env.NEXT_PUBLIC_AI_MAX_TOKENS,
        NEXT_PUBLIC_MAX_TRANSACTION_AMOUNT: process.env.NEXT_PUBLIC_MAX_TRANSACTION_AMOUNT,
        NEXT_PUBLIC_DEFAULT_SLIPPAGE: process.env.NEXT_PUBLIC_DEFAULT_SLIPPAGE
      });

      this.validateConfig();
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      } else {
        this.errors = ['Failed to load environment configuration'];
      }
      throw new Error('Environment configuration validation failed');
    }
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  private validateConfig(): void {
    // Additional validation rules
    if (this.isProduction()) {
      if (!this.config.NEXT_PUBLIC_CROSSMINT_API_KEY) {
        this.errors.push('Crossmint API key is required in production');
      }
      if (!this.config.NEXT_PUBLIC_HELIUS_API_KEY) {
        this.errors.push('Helius API key is required in production');
      }
    }
  }

  public getConfig(): EnvSchema {
    return this.config;
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public getNetworkEndpoint(): string {
    return this.config.NEXT_PUBLIC_SOLANA_RPC_HOST;
  }

  public getNetwork(): string {
    return this.config.NEXT_PUBLIC_SOLANA_NETWORK;
  }

  public getApiUrl(service: 'crossmint' | 'jupiter' | 'helius'): string {
    const urls = {
      crossmint: this.config.NEXT_PUBLIC_CROSSMINT_API_URL,
      jupiter: this.config.NEXT_PUBLIC_JUPITER_API_URL,
      helius: this.config.NEXT_PUBLIC_HELIUS_API_URL
    };
    return urls[service];
  }

  public getApiKey(service: 'crossmint' | 'jupiter' | 'helius'): string | undefined {
    const keys = {
      crossmint: this.config.NEXT_PUBLIC_CROSSMINT_API_KEY,
      jupiter: this.config.NEXT_PUBLIC_JUPITER_API_KEY,
      helius: this.config.NEXT_PUBLIC_HELIUS_API_KEY
    };
    return keys[service];
  }

  public isFeatureEnabled(feature: 'AI' | 'NFT' | 'SWAP' | 'STAKING'): boolean {
    const features = {
      AI: this.config.NEXT_PUBLIC_FEATURE_AI === 'true',
      NFT: this.config.NEXT_PUBLIC_FEATURE_NFT === 'true',
      SWAP: this.config.NEXT_PUBLIC_FEATURE_SWAP === 'true',
      STAKING: this.config.NEXT_PUBLIC_FEATURE_STAKING === 'true'
    };
    return features[feature];
  }

  public getAIConfig() {
    return {
      model: this.config.NEXT_PUBLIC_AI_MODEL,
      maxTokens: this.config.NEXT_PUBLIC_AI_MAX_TOKENS
    };
  }

  public getTransactionLimits() {
    return {
      maxAmount: this.config.NEXT_PUBLIC_MAX_TRANSACTION_AMOUNT,
      defaultSlippage: this.config.NEXT_PUBLIC_DEFAULT_SLIPPAGE
    };
  }

  public getValidationErrors(): string[] {
    return this.errors;
  }
}

// Export singleton instance
export const env = Environment.getInstance();

// Example .env.local file:
/*
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
NEXT_PUBLIC_CROSSMINT_API_KEY=your-crossmint-api-key
NEXT_PUBLIC_HELIUS_API_KEY=your-helius-api-key
NEXT_PUBLIC_FEATURE_AI=true
NEXT_PUBLIC_FEATURE_NFT=true
NEXT_PUBLIC_FEATURE_SWAP=true
NEXT_PUBLIC_FEATURE_STAKING=true
NEXT_PUBLIC_AI_MODEL=gpt-4
NEXT_PUBLIC_AI_MAX_TOKENS=1000
NEXT_PUBLIC_MAX_TRANSACTION_AMOUNT=1000
NEXT_PUBLIC_DEFAULT_SLIPPAGE=0.5
*/