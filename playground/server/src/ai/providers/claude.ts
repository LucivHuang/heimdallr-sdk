import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, AnalyzeOptions, AnalyzeResult } from './base';

export class ClaudeProvider extends BaseAIProvider {
  name = 'claude';
  private client: Anthropic;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async analyze(prompt: string, options?: AnalyzeOptions): Promise<AnalyzeResult> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 4096;

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: options?.systemPrompt,
      messages
    });

    const content = response.content[0];
    const textContent = content.type === 'text' ? content.text : '';

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    const cost = this.calculateCost(tokensUsed, model);

    return {
      content: textContent,
      tokensUsed,
      cost,
      model
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }

  protected calculateCost(tokensUsed: number, model: string): number {
    const inputCost = model.includes('opus') ? 0.015 : 0.003;
    const outputCost = model.includes('opus') ? 0.075 : 0.015;

    return (tokensUsed * (inputCost + outputCost)) / 1000;
  }
}
