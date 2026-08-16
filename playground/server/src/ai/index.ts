import { BaseAIProvider } from './providers/base';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';
import { OllamaProvider } from './providers/ollama';
import { AIConfig, defaultAIConfig } from '../config/ai.config';

class UnavailableProvider extends BaseAIProvider {
  name = 'unavailable';
  private reason: string;

  constructor(reason: string) {
    super();
    this.reason = reason;
  }

  async analyze(): Promise<never> {
    throw new Error(`AI服务不可用: ${this.reason}`);
  }

  async testConnection(): Promise<boolean> {
    return false;
  }
}

export class AIService {
  private provider: BaseAIProvider;
  private config: AIConfig;
  private initError: string | null = null;

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...defaultAIConfig, ...config };
    this.provider = this.createProvider();
  }

  private createProvider(): BaseAIProvider {
    try {
      switch (this.config.provider) {
        case 'claude':
          if (!this.config.claudeApiKey) {
            this.initError = 'Claude API key 未配置';
            return new UnavailableProvider(this.initError);
          }
          this.initError = null;
          return new ClaudeProvider(this.config.claudeApiKey);

        case 'openai':
          if (!this.config.openaiApiKey) {
            this.initError = 'OpenAI API key 未配置';
            return new UnavailableProvider(this.initError);
          }
          this.initError = null;
          return new OpenAIProvider(this.config.openaiApiKey);

        case 'ollama':
          this.initError = null;
          return new OllamaProvider(this.config.ollamaBaseURL);

        default:
          this.initError = `不支持的 AI 提供商: ${this.config.provider}`;
          return new UnavailableProvider(this.initError);
      }
    } catch (error: any) {
      this.initError = error.message;
      return new UnavailableProvider(this.initError);
    }
  }

  getProvider(): BaseAIProvider {
    return this.provider;
  }

  isAvailable(): boolean {
    return this.initError === null;
  }

  getError(): string | null {
    return this.initError;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    return this.provider.testConnection();
  }

  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
    this.provider = this.createProvider();
  }
}

export const aiService = new AIService();
