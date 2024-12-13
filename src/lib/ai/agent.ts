// src/lib/ai/agent.ts
import { Agent } from '@ai16z/eliza';
import { WalletState } from '@/types/wallet';

// AI Agent personalities and behaviors
const AGENT_TRAITS = {
  name: 'Finance AI',
  traits: {
    helpful: 0.9,
    professional: 0.8,
    knowledgeable: 0.9,
    cautious: 0.7
  },
  rules: [
    'Always verify transactions before approving',
    'Provide clear financial advice based on wallet activity',
    'Warn about suspicious or high-risk activities',
    'Maintain user privacy and security'
  ]
};

// Types for AI responses
export interface AIResponse {
  content: string;
  confidence: number;
  action?: 'APPROVE_TRANSACTION' | 'REJECT_TRANSACTION' | 'SUGGEST_ACTION';
  suggestion?: {
    type: string;
    details: string;
  };
}

export class WalletAIAgent {
  private agent: Agent;
  private context: {
    walletState?: WalletState;
    recentTransactions?: any[];
  };

  constructor() {
    this.agent = new Agent({
      name: AGENT_TRAITS.name,
      description: 'An AI assistant for managing your Solana wallet and providing financial insights',
      traits: AGENT_TRAITS.traits,
    });
    this.context = {};
  }

  public updateContext(walletState: WalletState, recentTransactions: any[] = []) {
    this.context = {
      walletState,
      recentTransactions
    };
  }

  public async analyze(query: string): Promise<AIResponse> {
    try {
      const response = await this.agent.process({
        type: 'message',
        content: query,
        context: {
          ...this.context,
          currentTime: new Date().toISOString(),
          rules: AGENT_TRAITS.rules
        }
      });

      // Process the response to extract actions and suggestions
      const processedResponse = this.processAgentResponse(response);
      return processedResponse;
    } catch (error) {
      console.error('AI Agent Error:', error);
      return {
        content: 'I apologize, but I encountered an error processing your request.',
        confidence: 0,
      };
    }
  }

  public async evaluateTransaction(
    toAddress: string,
    amount: number,
    purpose?: string
  ): Promise<AIResponse> {
    const query = `Please evaluate this transaction:
      To: ${toAddress}
      Amount: ${amount} SOL
      Purpose: ${purpose || 'Not specified'}
      Current balance: ${this.context.walletState?.balance || 0} SOL`;

    try {
      const response = await this.agent.process({
        type: 'message',
        content: query,
        context: {
          ...this.context,
          transactionDetails: {
            toAddress,
            amount,
            purpose
          }
        }
      });

      return this.processTransactionEvaluation(response);
    } catch (error) {
      console.error('Transaction Evaluation Error:', error);
      return {
        content: 'I cannot evaluate this transaction at the moment.',
        confidence: 0,
        action: 'REJECT_TRANSACTION'
      };
    }
  }

  private processAgentResponse(response: any): AIResponse {
    // Extract action and suggestion from response content
    const content = response.content;
    let action = undefined;
    let suggestion = undefined;

    // Basic pattern matching for actions
    if (content.toLowerCase().includes('approve')) {
      action = 'APPROVE_TRANSACTION';
    } else if (content.toLowerCase().includes('reject')) {
      action = 'REJECT_TRANSACTION';
    }

    // Look for suggestions in the response
    if (content.toLowerCase().includes('suggest')) {
      suggestion = {
        type: 'GENERAL_ADVICE',
        details: content
      };
    }

    return {
      content,
      confidence: response.confidence || 0.8,
      action,
      suggestion
    };
  }

  private processTransactionEvaluation(response: any): AIResponse {
    const baseResponse = this.processAgentResponse(response);
    
    // Additional transaction-specific processing
    const riskFactors = this.evaluateRiskFactors(
      this.context.walletState,
      baseResponse.content
    );

    return {
      ...baseResponse,
      suggestion: {
        type: 'TRANSACTION_RISK',
        details: riskFactors
      }
    };
  }

  private evaluateRiskFactors(walletState: any, content: string): string {
    const factors = [];

    // Balance check
    if (walletState?.balance) {
      const balance = parseFloat(walletState.balance);
      if (balance < 0.1) {
        factors.push('Low balance warning');
      }
    }

    // Suspicious keywords check
    const suspiciousTerms = ['urgent', 'immediate', 'guaranteed', 'profit'];
    for (const term of suspiciousTerms) {
      if (content.toLowerCase().includes(term)) {
        factors.push(`Suspicious term detected: ${term}`);
      }
    }

    return factors.join(', ') || 'No significant risk factors detected';
  }
}

// Create singleton instance
export const walletAI = new WalletAIAgent();