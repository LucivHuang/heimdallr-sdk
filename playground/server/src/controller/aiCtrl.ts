import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../ai';
import { ErrorAnalyzer } from '../ai/analyzers/error-analyzer';
import { PerformanceAnalyzer } from '../ai/analyzers/performance-analyzer';
import { TrendAnalyzer } from '../ai/analyzers/trend-analyzer';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export const aiCtrl = {
  async analyzeError(req: Request, res: Response) {
    try {
      if (!aiService.isAvailable()) {
        return res.json({
          code: -1,
          msg: `AI服务不可用: ${aiService.getError()}`
        });
      }

      const { logId } = req.body;

      if (!logId) {
        return res.json({ code: -1, msg: '缺少 logId 参数' });
      }

      const log = await prisma.log.findUnique({
        where: { id: logId }
      });

      if (!log) {
        return res.json({ code: -1, msg: '日志不存在' });
      }

      const existingAnalysis = await prisma.aIAnalysis.findFirst({
        where: {
          target_id: logId,
          type: 'error'
        },
        orderBy: { ctime: 'desc' }
      });

      if (existingAnalysis) {
        const result = JSON.parse(existingAnalysis.result);
        return res.json({
          code: 0,
          data: {
            ...result,
            cached: true,
            analysisId: existingAnalysis.id
          },
          msg: '分析成功（缓存）'
        });
      }

      const provider = aiService.getProvider();
      const analyzer = new ErrorAnalyzer(provider);

      const analysisResult = await analyzer.analyze(log);

      const analysis = await prisma.aIAnalysis.create({
        data: {
          id: nanoid(),
          type: 'error',
          target_id: logId,
          provider: analysisResult.metadata.provider,
          model: analysisResult.metadata.model,
          prompt: '',
          result: JSON.stringify(analysisResult),
          confidence: analysisResult.confidence,
          tokens_used: analysisResult.metadata.tokensUsed || 0,
          cost: analysisResult.metadata.cost || 0
        }
      });

      res.json({
        code: 0,
        data: {
          ...analysisResult,
          cached: false,
          analysisId: analysis.id
        },
        msg: '分析成功'
      });
    } catch (error: any) {
      console.error('Error analysis failed:', error);
      res.json({
        code: -1,
        msg: `分析失败: ${error.message}`
      });
    }
  },

  async testConnection(req: Request, res: Response) {
    try {
      if (!aiService.isAvailable()) {
        return res.json({
          code: -1,
          data: {
            connected: false,
            error: aiService.getError()
          },
          msg: `AI服务不可用: ${aiService.getError()}`
        });
      }

      const provider = aiService.getProvider();
      const isConnected = await provider.testConnection();

      res.json({
        code: 0,
        data: {
          connected: isConnected,
          provider: provider.name
        },
        msg: isConnected ? '连接成功' : '连接失败'
      });
    } catch (error: any) {
      res.json({
        code: -1,
        msg: `测试失败: ${error.message}`
      });
    }
  },

  async getConfig(req: Request, res: Response) {
    try {
      const provider = aiService.getProvider();

      res.json({
        code: 0,
        data: {
          provider: provider.name,
          available: ['claude', 'openai', 'ollama'],
          isAvailable: aiService.isAvailable(),
          error: aiService.getError()
        },
        msg: '获取配置成功'
      });
    } catch (error: any) {
      res.json({
        code: -1,
        msg: `获取配置失败: ${error.message}`
      });
    }
  },

  async updateConfig(req: Request, res: Response) {
    try {
      const { provider, ...config } = req.body;

      aiService.updateConfig({ provider, ...config });

      res.json({
        code: 0,
        msg: '更新配置成功'
      });
    } catch (error: any) {
      res.json({
        code: -1,
        msg: `更新配置失败: ${error.message}`
      });
    }
  },

  async analyzePerformance(req: Request, res: Response) {
    try {
      if (!aiService.isAvailable()) {
        return res.json({
          code: -1,
          msg: `AI服务不可用: ${aiService.getError()}`
        });
      }

      const { logId } = req.body;

      if (!logId) {
        return res.json({ code: -1, msg: '缺少 logId 参数' });
      }

      const log = await prisma.log.findUnique({
        where: { id: logId }
      });

      if (!log) {
        return res.json({ code: -1, msg: '日志不存在' });
      }

      const existingAnalysis = await prisma.aIAnalysis.findFirst({
        where: {
          target_id: logId,
          type: 'performance'
        },
        orderBy: { ctime: 'desc' }
      });

      if (existingAnalysis) {
        const result = JSON.parse(existingAnalysis.result);
        return res.json({
          code: 0,
          data: {
            ...result,
            cached: true,
            analysisId: existingAnalysis.id
          },
          msg: '分析成功（缓存）'
        });
      }

      const provider = aiService.getProvider();
      const analyzer = new PerformanceAnalyzer(provider);

      const analysisResult = await analyzer.analyze(log);

      const analysis = await prisma.aIAnalysis.create({
        data: {
          id: nanoid(),
          type: 'performance',
          target_id: logId,
          provider: analysisResult.metadata.provider,
          model: analysisResult.metadata.model,
          prompt: '',
          result: JSON.stringify(analysisResult),
          confidence: analysisResult.confidence,
          tokens_used: analysisResult.metadata.tokensUsed || 0,
          cost: analysisResult.metadata.cost || 0
        }
      });

      res.json({
        code: 0,
        data: {
          ...analysisResult,
          cached: false,
          analysisId: analysis.id
        },
        msg: '分析成功'
      });
    } catch (error: any) {
      console.error('Performance analysis failed:', error);
      res.json({
        code: -1,
        msg: `分析失败: ${error.message}`
      });
    }
  },

  async analyzeTrend(req: Request, res: Response) {
    try {
      if (!aiService.isAvailable()) {
        return res.json({
          code: -1,
          msg: `AI服务不可用: ${aiService.getError()}`
        });
      }

      const { metricName, timeRange, projectId } = req.body;

      if (!metricName || !timeRange) {
        return res.json({ code: -1, msg: '缺少必要参数' });
      }

      const logs = await prisma.log.findMany({
        where: {
          type: '3',
          ...(projectId && { ascription_id: projectId })
        },
        orderBy: { otime: 'desc' },
        take: 30
      });

      const dataPoints = logs.map(log => {
        const data = typeof log.data === 'string' ? JSON.parse(log.data) : log.data;
        return {
          date: new Date(log.otime).toLocaleDateString('zh-CN'),
          value: data[metricName] || 0
        };
      }).reverse();

      const provider = aiService.getProvider();
      const analyzer = new TrendAnalyzer(provider);

      const analysisResult = await analyzer.analyze({
        metricName,
        timeRange,
        dataPoints,
        projectName: projectId || '全局'
      });

      const insight = await prisma.aIInsight.create({
        data: {
          id: nanoid(),
          type: 'trend',
          severity: this.calculateSeverity(analysisResult),
          title: `${metricName} 趋势分析`,
          description: analysisResult.summary,
          data: JSON.stringify(analysisResult),
          project_id: projectId || null
        }
      });

      res.json({
        code: 0,
        data: {
          ...analysisResult,
          insightId: insight.id
        },
        msg: '分析成功'
      });
    } catch (error: any) {
      console.error('Trend analysis failed:', error);
      res.json({
        code: -1,
        msg: `分析失败: ${error.message}`
      });
    }
  },

  async getInsights(req: Request, res: Response) {
    try {
      const { projectId, type, isRead } = req.query;

      const insights = await prisma.aIInsight.findMany({
        where: {
          ...(projectId && { project_id: projectId as string }),
          ...(type && { type: type as string }),
          ...(isRead !== undefined && { is_read: isRead === 'true' })
        },
        orderBy: { ctime: 'desc' },
        take: 20
      });

      res.json({
        code: 0,
        data: insights,
        msg: '获取成功'
      });
    } catch (error: any) {
      res.json({
        code: -1,
        msg: `获取失败: ${error.message}`
      });
    }
  },

  async markInsightRead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.aIInsight.update({
        where: { id },
        data: { is_read: true }
      });

      res.json({
        code: 0,
        msg: '标记成功'
      });
    } catch (error: any) {
      res.json({
        code: -1,
        msg: `标记失败: ${error.message}`
      });
    }
  },

  calculateSeverity(analysisResult: any): string {
    const score = analysisResult.details?.score || 5;
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
};
