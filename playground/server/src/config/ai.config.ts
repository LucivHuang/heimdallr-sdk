export interface AIConfig {
  provider: 'claude' | 'openai' | 'ollama';
  claudeApiKey?: string;
  claudeModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  ollamaBaseURL?: string;
  ollamaModel?: string;
  cacheTTL?: number;
  maxConcurrent?: number;
  rateLimit?: number;
}

export const defaultAIConfig: AIConfig = {
  provider: (process.env.AI_PROVIDER as any) || 'claude',
  claudeApiKey: process.env.AI_CLAUDE_API_KEY,
  claudeModel: process.env.AI_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  openaiApiKey: process.env.AI_OPENAI_API_KEY,
  openaiModel: process.env.AI_OPENAI_MODEL || 'gpt-4-turbo-preview',
  ollamaBaseURL: process.env.AI_OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.AI_OLLAMA_MODEL || 'llama2',
  cacheTTL: parseInt(process.env.AI_CACHE_TTL || '3600'),
  maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT || '5'),
  rateLimit: parseInt(process.env.AI_RATE_LIMIT || '100')
};
