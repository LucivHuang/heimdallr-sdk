import { BaseAIProvider } from '../providers/base';
import { buildTrendAnalysisPrompt, TREND_ANALYSIS_SYSTEM_PROMPT, TrendPromptData } from '../prompts/trend-prompts';

export interface AnalysisResult {
  type: string;
  summary: string;
  details: any;
  recommendations: string[];
  confidence: number;
  metadata: Record<string, any>;
}

export class TrendAnalyzer {
  constructor(private provider: BaseAIProvider) {}

  async analyze(metricData: any): Promise<AnalysisResult> {
    const trendData = this.prepareTrendData(metricData);
    const prompt = buildTrendAnalysisPrompt(trendData);

    const result = await this.provider.analyze(prompt, {
      systemPrompt: TREND_ANALYSIS_SYSTEM_PROMPT,
      temperature: 0.3,
      maxTokens: 2048
    });

    const parsed = this.parseAnalysisResult(result.content);

    return {
      type: 'trend',
      summary: parsed.summary,
      details: {
        trend: parsed.trend,
        anomalies: parsed.anomalies,
        predictions: parsed.predictions,
        alerts: parsed.alerts,
        rawAnalysis: result.content
      },
      recommendations: parsed.predictions,
      confidence: this.calculateConfidence(result, metricData),
      metadata: {
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        model: result.model,
        provider: this.provider.name
      }
    };
  }

  private prepareTrendData(metricData: any): TrendPromptData {
    const { metricName, timeRange, dataPoints, projectName } = metricData;

    const values = dataPoints.map((p: any) => p.value);
    const currentValue = values[values.length - 1] || 0;
    const avgValue = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    return {
      metricName,
      timeRange,
      dataPoints,
      currentValue,
      avgValue,
      maxValue,
      minValue,
      projectName
    };
  }

  private parseAnalysisResult(content: string): any {
    const sections = {
      summary: '',
      trend: '',
      anomalies: '',
      predictions: [] as string[],
      alerts: ''
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.includes('趋势识别')) {
        currentSection = 'trend';
      } else if (line.includes('异常检测')) {
        currentSection = 'anomalies';
      } else if (line.includes('预测') || line.includes('建议')) {
        currentSection = 'predictions';
      } else if (line.includes('告警')) {
        currentSection = 'alerts';
      } else if (line.trim() && currentSection) {
        if (currentSection === 'predictions') {
          if (line.trim().match(/^[-*\d.]/)) {
            sections.predictions.push(line.trim());
          }
        } else {
          sections[currentSection] += line + '\n';
        }
      }
    }

    sections.summary = content.substring(0, 200).trim() + '...';

    return sections;
  }

  private calculateConfidence(result: any, metricData: any): number {
    let confidence = 0.6;

    if (metricData.dataPoints && metricData.dataPoints.length >= 7) {
      confidence += 0.2;
    }

    if (metricData.dataPoints && metricData.dataPoints.length >= 30) {
      confidence += 0.1;
    }

    if (result.tokensUsed && result.tokensUsed > 500) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}
