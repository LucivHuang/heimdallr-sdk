import axios from 'axios';
import { BaseAIProvider, AnalyzeOptions, AnalyzeResult } from './base';

export class OllamaProvider extends BaseAIProvider {
  name = 'ollama';
  private baseURL: string;
  private defaultModel = 'llama2';

  constructor(baseURL: string = 'http://localhost:11434') {
    super();
    this.baseURL = baseURL;
  }

  async analyze(prompt: string, options?: AnalyzeOptions): Promise<AnalyzeResult> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;

    const fullPrompt = options?.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;

    const response = await axios.post(`${this.baseURL}/api/generate`, {
      model,
      prompt: fullPrompt,
      temperature,
      stream: false
    });

    const content = response.data.response || '';

    return {
      content,
      tokensUsed: 0,
      cost: 0,
      model
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }
}
