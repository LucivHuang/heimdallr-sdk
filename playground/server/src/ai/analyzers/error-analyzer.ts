import { BaseAIProvider } from '../providers/base';
import { buildErrorAnalysisPrompt, ERROR_ANALYSIS_SYSTEM_PROMPT, ErrorPromptData } from '../prompts/error-prompts';

export interface AnalysisResult {
  type: string;
  summary: string;
  details: any;
  recommendations: string[];
  confidence: number;
  metadata: Record<string, any>;
}

export class ErrorAnalyzer {
  constructor(private provider: BaseAIProvider) {}

  async analyze(logData: any): Promise<AnalysisResult> {
    const errorData = this.extractErrorData(logData);
    const prompt = buildErrorAnalysisPrompt(errorData);

    const result = await this.provider.analyze(prompt, {
      systemPrompt: ERROR_ANALYSIS_SYSTEM_PROMPT,
      temperature: 0.3,
      maxTokens: 2048
    });

    const parsed = this.parseAnalysisResult(result.content);

    return {
      type: 'error',
      summary: parsed.summary,
      details: {
        rootCause: parsed.rootCause,
        fixSuggestions: parsed.fixSuggestions,
        prevention: parsed.prevention,
        severity: parsed.severity,
        rawAnalysis: result.content
      },
      recommendations: parsed.fixSuggestions,
      confidence: this.calculateConfidence(result, logData),
      metadata: {
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        model: result.model,
        provider: this.provider.name
      }
    };
  }

  private extractErrorData(logData: any): ErrorPromptData {
    const data = typeof logData.data === 'string' ? JSON.parse(logData.data) : logData.data;

    return {
      errorType: this.getErrorType(logData.type, logData.sub_type),
      errorMessage: data.message || data.reason || '未知错误',
      stackTrace: data.stack || data.error?.stack,
      timestamp: new Date(logData.otime).toLocaleString('zh-CN'),
      userAgent: data.userAgent,
      breadcrumbs: data.breadcrumb || [],
      url: logData.path || data.url,
      platform: logData.platform
    };
  }

  private getErrorType(type: string, subType: string): string {
    const typeMap: Record<string, string> = {
      '21': 'JavaScript 错误',
      '22': '资源加载错误',
      '23': 'Promise 未捕获错误',
      '91': 'Vue 错误'
    };

    return typeMap[subType] || `错误类型 ${type}-${subType}`;
  }

  private parseAnalysisResult(content: string): any {
    const sections = {
      summary: '',
      rootCause: '',
      fixSuggestions: [] as string[],
      prevention: '',
      severity: 5
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.includes('错误根因') || line.includes('根本原因')) {
        currentSection = 'rootCause';
      } else if (line.includes('修复建议') || line.includes('修复方案')) {
        currentSection = 'fixSuggestions';
      } else if (line.includes('预防措施')) {
        currentSection = 'prevention';
      } else if (line.includes('严重程度')) {
        currentSection = 'severity';
        const match = line.match(/(\d+)/);
        if (match) {
          sections.severity = parseInt(match[1]);
        }
      } else if (line.trim() && currentSection) {
        if (currentSection === 'fixSuggestions') {
          if (line.trim().match(/^[-*\d.]/)) {
            sections.fixSuggestions.push(line.trim());
          }
        } else if (currentSection !== 'severity') {
          sections[currentSection] += line + '\n';
        }
      }
    }

    sections.summary = content.substring(0, 200).trim() + '...';

    return sections;
  }

  private calculateConfidence(result: any, logData: any): number {
    let confidence = 0.7;

    if (logData.data?.stack) {
      confidence += 0.15;
    }

    if (logData.data?.breadcrumb?.length > 0) {
      confidence += 0.1;
    }

    if (result.tokensUsed && result.tokensUsed > 500) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }
}
