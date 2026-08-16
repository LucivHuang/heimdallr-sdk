import { BaseAIProvider } from '../providers/base';
import { buildPerformanceAnalysisPrompt, PERFORMANCE_ANALYSIS_SYSTEM_PROMPT, PerformancePromptData } from '../prompts/performance-prompts';

export interface AnalysisResult {
  type: string;
  summary: string;
  details: any;
  recommendations: string[];
  confidence: number;
  metadata: Record<string, any>;
}

export class PerformanceAnalyzer {
  constructor(private provider: BaseAIProvider) {}

  async analyze(logData: any): Promise<AnalysisResult> {
    const perfData = this.extractPerformanceData(logData);
    const prompt = buildPerformanceAnalysisPrompt(perfData);

    const result = await this.provider.analyze(prompt, {
      systemPrompt: PERFORMANCE_ANALYSIS_SYSTEM_PROMPT,
      temperature: 0.3,
      maxTokens: 2048
    });

    const parsed = this.parseAnalysisResult(result.content);

    return {
      type: 'performance',
      summary: parsed.summary,
      details: {
        bottlenecks: parsed.bottlenecks,
        optimizations: parsed.optimizations,
        bestPractices: parsed.bestPractices,
        score: parsed.score,
        rawAnalysis: result.content
      },
      recommendations: parsed.optimizations,
      confidence: this.calculateConfidence(result, logData),
      metadata: {
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        model: result.model,
        provider: this.provider.name
      }
    };
  }

  private extractPerformanceData(logData: any): PerformancePromptData {
    const data = typeof logData.data === 'string' ? JSON.parse(logData.data) : logData.data;

    return {
      loadTime: data.loadTime || data.timing?.loadEventEnd,
      fcp: data.fcp || data.paint?.fcp,
      lcp: data.lcp || data.paint?.lcp,
      fmp: data.fmp || data.timing?.fmp,
      fps: data.fps,
      slowApis: this.extractSlowApis(data),
      resources: data.resources || data.resource,
      timestamp: new Date(logData.otime).toLocaleString('zh-CN'),
      url: logData.path || data.url,
      platform: logData.platform
    };
  }

  private extractSlowApis(data: any): any[] {
    const apis: any[] = [];

    if (data.xhr) {
      apis.push(...data.xhr.filter((x: any) => x.elapsedTime > 1000));
    }

    if (data.fetch) {
      apis.push(...data.fetch.filter((f: any) => f.elapsedTime > 1000));
    }

    return apis;
  }

  private parseAnalysisResult(content: string): any {
    const sections = {
      summary: '',
      bottlenecks: '',
      optimizations: [] as string[],
      bestPractices: '',
      score: 5
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.includes('性能瓶颈') || line.includes('瓶颈识别')) {
        currentSection = 'bottlenecks';
      } else if (line.includes('优化建议') || line.includes('优化方案')) {
        currentSection = 'optimizations';
      } else if (line.includes('最佳实践')) {
        currentSection = 'bestPractices';
      } else if (line.includes('性能评分')) {
        currentSection = 'score';
        const match = line.match(/(\d+)/);
        if (match) {
          sections.score = parseInt(match[1]);
        }
      } else if (line.trim() && currentSection) {
        if (currentSection === 'optimizations') {
          if (line.trim().match(/^[-*\d.]/)) {
            sections.optimizations.push(line.trim());
          }
        } else if (currentSection !== 'score') {
          sections[currentSection] += line + '\n';
        }
      }
    }

    sections.summary = content.substring(0, 200).trim() + '...';

    return sections;
  }

  private calculateConfidence(result: any, logData: any): number {
    let confidence = 0.7;

    const data = typeof logData.data === 'string' ? JSON.parse(logData.data) : logData.data;

    if (data.fcp || data.lcp) {
      confidence += 0.1;
    }

    if (data.resources && data.resources.length > 0) {
      confidence += 0.1;
    }

    if (result.tokensUsed && result.tokensUsed > 500) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}
