// src/lib/ai/agent.ts
import { WalletState } from '@/types/wallet';
import { env } from '@/config/env';
import { ErrorHandler } from '@/lib/utils/error-handling';

export interface AgentTrait {
  name: string;
  value: number;
}

export interface AgentConfig {
  name: string;
  description: string;
  traits: Record<string, number>;
}

export interface AgentContext {
  walletState?: WalletState;
  marketData?: any;
  transactionHistory?: any[];
  userPreferences?: {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentStyle: 'conservative' | 'moderate' | 'aggressive';
  };
}

export interface AgentMessage {
  type: 'question' | 'analysis' | 'warning' | 'suggestion';
  content: string;
  context?: any;
}

export interface AgentResponse {
  content: string;
  confidence: number;
  suggestion?: {
    type: 'approve' | 'reject' | 'warning' | 'advice';
    action?: string;
    reason?: string;
  };
  analysis?: {
    risk: number;
    factors: string[];
    recommendation: string;
  };
}

export class Agent {
  private config: AgentConfig;
  private context: AgentContext;

  constructor(config: AgentConfig) {
    this.config = config;
    this.context = {};
  }

  public async process(message: AgentMessage): Promise<AgentResponse> {
    try {
      switch (message.type) {
        case 'analysis':
          return this.analyzeTransaction(message);
        case 'question':
          return this.provideAdvice(message);
        case 'warning':
          return this.assessRisk(message);
        case 'suggestion':
          return this.makeSuggestion(message);
        default:
          throw new Error('Unknown message type');
      }
    } catch (error) {
      throw ErrorHandler.createError(500, 'AI_ERROR', 'Failed to process message');
    }
  }

  public updateContext(context: Partial<AgentContext>): void {
    this.context = {
      ...this.context,
      ...context
    };
  }

  private async analyzeTransaction(message: AgentMessage): Promise<AgentResponse> {
    const { amount, recipient, purpose } = message.context || {};
    const walletState = this.context.walletState;

    // Perform basic transaction analysis
    const risk = this.calculateTransactionRisk(amount, recipient);
    const factors = this.analyzeRiskFactors(amount, recipient, purpose);

    return {
      content: this.generateAnalysisResponse(risk, factors),
      confidence: 0.85,
      suggestion: {
        type: risk > 0.7 ? 'reject' : risk > 0.4 ? 'warning' : 'approve',
        reason: factors.join(', '),
        action: this.suggestAction(risk)
      },
      analysis: {
        risk: risk * 100,
        factors,
        recommendation: this.generateRecommendation(risk, factors)
      }
    };
  }

  private async provideAdvice(message: AgentMessage): Promise<AgentResponse> {
    return {
      content: this.generateAdviceResponse(message.content),
      confidence: 0.8,
      suggestion: {
        type: 'advice',
        action: 'Consider the provided information'
      }
    };
  }

  private async assessRisk(message: AgentMessage): Promise<AgentResponse> {
    const riskAnalysis = this.performRiskAssessment(message.context);
    return {
      content: this.generateRiskResponse(riskAnalysis),
      confidence: 0.9,
      analysis: {
        risk: riskAnalysis.riskScore,
        factors: riskAnalysis.factors,
        recommendation: riskAnalysis.recommendation
      }
    };
  }

  private async makeSuggestion(message: AgentMessage): Promise<AgentResponse> {
    return {
      content: this.generateSuggestionResponse(message.content),
      confidence: 0.75,
      suggestion: {
        type: 'advice',
        action: this.generateActionSuggestion(message.context)
      }
    };
  }

  private calculateTransactionRisk(amount: number, recipient: string): number {
    let risk = 0;
    const balance = parseFloat(this.context.walletState?.balance || '0');

    // Calculate risk based on amount relative to balance
    if (amount > balance * 0.5) risk += 0.3;
    if (amount > balance * 0.8) risk += 0.3;

    // Add additional risk factors
    if (!this.context.transactionHistory?.some(tx => tx.to === recipient)) {
      risk += 0.2; // New recipient
    }

    return Math.min(risk, 1);
  }

  private analyzeRiskFactors(amount: number, recipient: string, purpose?: string): string[] {
    const factors: string[] = [];
    const balance = parseFloat(this.context.walletState?.balance || '0');

    if (amount > balance * 0.5) {
      factors.push('Large transaction relative to balance');
    }

    if (!this.context.transactionHistory?.some(tx => tx.to === recipient)) {
      factors.push('First transaction to this recipient');
    }

    if (!purpose) {
      factors.push('No purpose specified');
    }

    return factors;
  }

  private generateAnalysisResponse(risk: number, factors: string[]): string {
    if (risk > 0.7) {
      return `High-risk transaction detected. Concerns: ${factors.join(', ')}. Consider reviewing the transaction details.`;
    } else if (risk > 0.4) {
      return `Moderate risk detected. Factors to consider: ${factors.join(', ')}. Proceed with caution.`;
    }
    return `Transaction appears safe. Standard precautions apply.`;
  }

  private suggestAction(risk: number): string {
    if (risk > 0.7) return 'Review and verify transaction details';
    if (risk > 0.4) return 'Proceed with caution';
    return 'Safe to proceed';
  }

  private generateRecommendation(risk: number, factors: string[]): string {
    if (risk > 0.7) {
      return `High risk detected. Consider: \n- Verifying recipient\n- Reviewing amount\n- Adding transaction purpose`;
    }
    return `Transaction within normal parameters. Standard verification recommended.`;
  }

  private generateAdviceResponse(question: string): string {
    // Implement advice generation logic
    return `Based on your wallet activity and market conditions, I recommend...`;
  }

  private performRiskAssessment(context: any) {
    // Implement risk assessment logic
    return {
      riskScore: 50,
      factors: ['Market volatility', 'Transaction size'],
      recommendation: 'Consider splitting the transaction'
    };
  }

  private generateRiskResponse(analysis: any): string {
    return `Risk assessment complete. Score: ${analysis.riskScore}/100. ${analysis.recommendation}`;
  }

  private generateSuggestionResponse(content: string): string {
    return `Based on your query, I suggest...`;
  }

  private generateActionSuggestion(context: any): string {
    return `Consider reviewing the transaction details before proceeding.`;
  }
}