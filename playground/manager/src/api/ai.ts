import http from '../helper/http';

export interface AIAnalysisResult {
  type: string;
  summary: string;
  details: {
    rootCause?: string;
    fixSuggestions?: string[];
    prevention?: string;
    severity?: number;
    bottlenecks?: string;
    optimizations?: string[];
    bestPractices?: string;
    score?: number;
    trend?: string;
    anomalies?: string;
    predictions?: string[];
    alerts?: string;
    rawAnalysis: string;
  };
  recommendations: string[];
  confidence: number;
  metadata: {
    tokensUsed?: number;
    cost?: number;
    model: string;
    provider: string;
  };
  cached?: boolean;
  analysisId?: string;
}

export interface AIInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  data: string;
  project_id?: string;
  is_read: boolean;
  ctime: string;
}

export const aiApi = {
  analyzeError(logId: string): Promise<AIAnalysisResult> {
    return http.post('/ai/analyze/error', { logId });
  },

  analyzePerformance(logId: string): Promise<AIAnalysisResult> {
    return http.post('/ai/analyze/performance', { logId });
  },

  analyzeTrend(params: {
    metricName: string;
    timeRange: string;
    projectId?: string;
  }): Promise<AIAnalysisResult> {
    return http.post('/ai/analyze/trend', params);
  },

  getInsights(params?: {
    projectId?: string;
    type?: string;
    isRead?: boolean;
  }): Promise<AIInsight[]> {
    return http.get('/ai/insights', params);
  },

  markInsightRead(id: string): Promise<void> {
    return http.put(`/ai/insights/${id}/read`, {});
  },

  testConnection(): Promise<{ connected: boolean; provider: string }> {
    return http.post('/ai/config/test', {});
  },

  getConfig(): Promise<{ provider: string; available: string[] }> {
    return http.get('/ai/config');
  },

  updateConfig(config: any): Promise<void> {
    return http.put('/ai/config', config);
  }
};
