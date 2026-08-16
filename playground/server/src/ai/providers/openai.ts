import OpenAI from 'openai';
import { BaseAIProvider, AnalyzeOptions, AnalyzeResult } from './base';

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai';
  private client: OpenAI;
  private defaultModel = 'gpt-4-turbo-preview';

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({ apiKey });
  }

  async analyze(prompt: string, options?: AnalyzeOptions): Promise<AnalyzeResult> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 4096;

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;
    const cost = this.calculateCost(tokensUsed, model);

    return {
      content,
      tokensUsed,
      cost,
      model
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      });
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  protected calculateCost(tokensUsed: number, model: string): number {
    let costPer1k = 0.01;

    if (model.includes('gpt-4')) {
      costPer1k = model.includes('turbo') ? 0.01 : 0.03;
    } else if (model.includes('gpt-3.5')) {
      costPer1k = 0.002;
    }

    return (tokensUsed * costPer1k) / 1000;
  }
}
