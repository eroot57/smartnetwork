// src/lib/ai/agent-service.ts
//import { Agent } from '@a16z/eliza';
import { WalletState } from '@/types/wallet';
import { ErrorHandler } from '@/lib/utils/error-handling';
import { apiService } from '@/services/api';
import { Agent } from './agent';
//import { Agent } from '@solanagaentkit';
interface AgentContext {
  walletState: WalletState;
  recentTransactions?: Array<any>;
  userPreferences?: UserPreferences;
  marketData?: MarketData;
}

interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentStyle: 'conservative' | 'moderate' | 'aggressive';
  aiPersonality: 'professional' | 'friendly' | 'technical';
}

interface MarketData {
  solPrice: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
}

interface AgentResponse {
  content: string;
  confidence: number;
  suggestion?: {
    type: 'transaction' | 'swap' | 'stake' | 'warning';
    action?: string;
    data?: any;
  };
  analysis?: {
    risk: number;
    opportunity: number;
    recommendation: string;
  };
}

class AIAgentService {
  private static instance: AIAgentService;
  private agent: Agent;
  private context: AgentContext;
  private prompts: Map<string, string> = new Map();

  private constructor() {
    this.agent = new Agent({
      name: 'Finance AI',
      description: 'AI assistant for Solana wallet management and financial analysis',
      traits: {
        analytical: 0.9,
        cautious: 0.8,
        helpful: 0.9,
        professional: 0.85
      }
    });

    this.context = {
      walletState: {
        address: '',
        balance: '0',
        isLoading: false,
        error: null
      }
    };

    this.initializePrompts();
  }

  private initializePrompts() {
    this.prompts = new Map([
      ['transactionAnalysis', `
        Analyze the following transaction:
        Amount: {amount} SOL
        Recipient: {recipient}
        Current Balance: {balance} SOL
        Purpose: {purpose}
        Recent Transactions: {recentTransactions}
        
        Provide a risk assessment and recommendation.
      `],
      ['marketAnalysis', `
        Analyze current market conditions:
        SOL Price: ${this.context.marketData?.solPrice}
        Market Trend: ${this.context.marketData?.marketTrend}
        Volatility Index: ${this.context.marketData?.volatilityIndex}
        
        Provide market insights and opportunities.
      `],
      ['portfolioAdvice', `
        Based on the user's:
        Risk Tolerance: {riskTolerance}
        Investment Style: {investmentStyle}
        Current Holdings: {holdings}
        
        Provide portfolio optimization advice.
      `]
    ]);
  }

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  public async initializeAgent(context: Partial<AgentContext>) {
    this.context = { ...this.context, ...context };
    await this.updateMarketData();
  }

  private async updateMarketData() {
    try {
      const { data } = await apiService.getMarketAnalysis('SOL');
      this.context.marketData = {
        solPrice: (data as any).price,
        marketTrend: (data as any).trend,
        volatilityIndex: (data as any).volatility
      };
    } catch (error) {
      console.error('Failed to update market data:', error);
    }
  }

  public async analyzeTransaction(
    amount: number,
    recipient: string,
    purpose?: string
  ): Promise<AgentResponse> {
    try {
      const prompt = this.prompts.get('transactionAnalysis')!
        .replace('{amount}', amount.toString())
        .replace('{recipient}', recipient)
        .replace('{balance}', this.context.walletState.balance)
        .replace('{purpose}', purpose || 'Not specified')
        .replace('{recentTransactions}', JSON.stringify(this.context.recentTransactions));

      const response = await this.agent.process({
        type: 'analysis',
        content: prompt,
        context: this.context
      });

      return this.processAgentResponse(response);
    } catch (error) {
      throw ErrorHandler.createError(500, 'AI_ERROR', 'Failed to analyze transaction');
    }
  }

  public async getMarketInsights(): Promise<AgentResponse> {
    try {
      await this.updateMarketData();
      const prompt = this.prompts.get('marketAnalysis')!;

      const response = await this.agent.process({
        type: 'analysis',
        content: prompt,
        context: this.context
      });

      return this.processAgentResponse(response);
    } catch (error) {
      throw ErrorHandler.createError(500, 'AI_ERROR', 'Failed to get market insights');
    }
  }

  public async getPortfolioAdvice(): Promise<AgentResponse> {
    try {
      const prompt = this.prompts.get('portfolioAdvice')!
        .replace('{riskTolerance}', this.context.userPreferences?.riskTolerance || 'medium')
        .replace('{investmentStyle}', this.context.userPreferences?.investmentStyle || 'moderate')
        .replace('{holdings}', JSON.stringify(this.context.walletState));

      const response = await this.agent.process({
        type: 'analysis',
        content: prompt,
        context: this.context
      });

      return this.processAgentResponse(response);
    } catch (error) {
      throw ErrorHandler.createError(500, 'AI_ERROR', 'Failed to get portfolio advice');
    }
  }

  private processAgentResponse(response: any): AgentResponse {
    // Extract suggestions and analysis from response content
    const suggestion = this.extractSuggestion(response.content);
    const analysis = this.extractAnalysis(response.content);

    return {
      content: response.content,
      confidence: response.confidence || 0.8,
      suggestion,
      analysis
    };
  }

  private extractSuggestion(content: string): AgentResponse['suggestion'] | undefined {
    // Implement suggestion extraction logic
    if (content.includes('SUGGESTION:')) {
      const suggestionMatch = content.match(/SUGGESTION: (.*?)(?:\n|$)/);
      if (suggestionMatch) {
        return {
          type: this.determineSuggestionType(suggestionMatch[1]),
          action: suggestionMatch[1]
        };
      }
    }
    return undefined;
  }

  private extractAnalysis(content: string): AgentResponse['analysis'] | undefined {
    // Implement analysis extraction logic
    const riskMatch = content.match(/Risk: (\d+)/);
    const opportunityMatch = content.match(/Opportunity: (\d+)/);
    const recommendationMatch = content.match(/Recommendation: (.*?)(?:\n|$)/);

    if (riskMatch || opportunityMatch || recommendationMatch) {
      return {
        risk: riskMatch ? parseInt(riskMatch[1]) : 0,
        opportunity: opportunityMatch ? parseInt(opportunityMatch[1]) : 0,
        recommendation: recommendationMatch ? recommendationMatch[1] : ''
      };
    }
    return undefined;
  }

  private determineSuggestionType(suggestion: string): NonNullable<AgentResponse['suggestion']>['type'] {
    if (suggestion.toLowerCase().includes('transaction')) return 'transaction';
    if (suggestion.toLowerCase().includes('swap')) return 'swap';
    if (suggestion.toLowerCase().includes('stake')) return 'stake';
    return 'warning';
  }

  public updateUserPreferences(preferences: Partial<UserPreferences>) {
    this.context.userPreferences = {
      riskTolerance: preferences.riskTolerance || this.context.userPreferences?.riskTolerance || 'medium',
      investmentStyle: preferences.investmentStyle || this.context.userPreferences?.investmentStyle || 'moderate',
      aiPersonality: preferences.aiPersonality || this.context.userPreferences?.aiPersonality || 'professional'
    };
  }
}

// Export singleton instance
export const aiAgentService = AIAgentService.getInstance();

// Example usage:
/*
const agent = AIAgentService.getInstance();

// Initialize agent with wallet context
await agent.initializeAgent({
  walletState: {
    address: 'wallet-address',
    balance: '100',
    isLoading: false,
    error: null
  }
});

// Analyze transaction
const analysis = await agent.analyzeTransaction(
  1.5,
  'recipient-address',
  'Payment for services'
);

// Get market insights
const insights = await agent.getMarketInsights();

// Get portfolio advice
const advice = await agent.getPortfolioAdvice();
*/