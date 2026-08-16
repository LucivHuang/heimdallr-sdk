export interface PerformancePromptData {
  loadTime?: number;
  fcp?: number;
  lcp?: number;
  fmp?: number;
  fps?: number;
  slowApis?: Array<{
    url: string;
    method: string;
    elapsedTime: number;
    status: number;
  }>;
  resources?: Array<{
    name: string;
    duration: number;
    size?: number;
  }>;
  timestamp: string;
  url?: string;
  platform?: string;
}

export function buildPerformanceAnalysisPrompt(data: PerformancePromptData): string {
  const { loadTime, fcp, lcp, fmp, fps, slowApis, resources, timestamp, url, platform } = data;

  let prompt = `你是一个前端性能优化专家。请分析以下性能数据并提供优化建议。

## 性能指标

**页面 URL：** ${url || '未知'}
**平台：** ${platform || '未知'}
**采集时间：** ${timestamp}
`;

  if (loadTime) {
    prompt += `**页面加载时间：** ${loadTime}ms\n`;
  }

  if (fcp) {
    prompt += `**首次内容绘制 (FCP)：** ${fcp}ms\n`;
  }

  if (lcp) {
    prompt += `**最大内容绘制 (LCP)：** ${lcp}ms\n`;
  }

  if (fmp) {
    prompt += `**首次有意义绘制 (FMP)：** ${fmp}ms\n`;
  }

  if (fps) {
    prompt += `**帧率 (FPS)：** ${fps}\n`;
  }

  if (slowApis && slowApis.length > 0) {
    prompt += `\n**慢 API 请求（耗时 > 1s）：**\n`;
    slowApis.slice(0, 5).forEach((api, idx) => {
      prompt += `${idx + 1}. ${api.method} ${api.url}\n`;
      prompt += `   耗时: ${api.elapsedTime}ms, 状态: ${api.status}\n`;
    });
  }

  if (resources && resources.length > 0) {
    const slowResources = resources.filter(r => r.duration > 1000).slice(0, 5);
    if (slowResources.length > 0) {
      prompt += `\n**慢资源加载（耗时 > 1s）：**\n`;
      slowResources.forEach((res, idx) => {
        prompt += `${idx + 1}. ${res.name}\n`;
        prompt += `   耗时: ${res.duration}ms${res.size ? `, 大小: ${(res.size / 1024).toFixed(2)}KB` : ''}\n`;
      });
    }
  }

  prompt += `\n## 请提供以下分析

### 1. 性能瓶颈识别
请识别主要的性能瓶颈，包括：
- 最影响用户体验的性能问题
- 问题的严重程度排序
- 每个问题的影响范围

### 2. 优化建议
请提供具体的优化方案，包括：
- 优先级排序的优化措施
- 具体的实施步骤
- 预期的性能提升效果

### 3. 最佳实践
请建议性能优化的最佳实践：
- 代码层面的优化
- 资源加载策略
- 缓存策略

### 4. 性能评分
根据 Web Vitals 标准评估当前性能（1-10 分）并说明理由。

请用中文回答，保持专业和实用。`;

  return prompt;
}

export const PERFORMANCE_ANALYSIS_SYSTEM_PROMPT = `你是一个经验丰富的前端性能优化专家。你擅长：
1. 分析 Web Vitals 指标（FCP, LCP, FID, CLS）
2. 识别性能瓶颈和优化机会
3. 提供可执行的优化方案
4. 评估优化效果和投入产出比

请始终基于数据给出客观、实用的建议。`;
