export interface AnalyzeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AnalyzeResult {
  content: string;
  tokensUsed?: number;
  cost?: number;
  model: string;
}

export abstract class BaseAIProvider {
  abstract name: string;

  abstract analyze(prompt: string, options?: AnalyzeOptions): Promise<AnalyzeResult>;

  abstract testConnection(): Promise<boolean>;

  protected calculateCost(tokensUsed: number, model: string): number {
    return 0;
  }
}
