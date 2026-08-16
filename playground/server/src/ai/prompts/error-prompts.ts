export interface ErrorPromptData {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  timestamp: string;
  userAgent?: string;
  breadcrumbs?: any[];
  url?: string;
  platform?: string;
}

export function buildErrorAnalysisPrompt(data: ErrorPromptData): string {
  const { errorType, errorMessage, stackTrace, timestamp, userAgent, breadcrumbs, url, platform } = data;

  let prompt = `你是一个前端错误分析专家。请分析以下错误信息并提供详细的诊断和修复建议。

## 错误信息

**错误类型：** ${errorType}
**错误消息：** ${errorMessage}
**发生时间：** ${timestamp}
**页面 URL：** ${url || '未知'}
**平台：** ${platform || '未知'}
`;

  if (userAgent) {
    prompt += `**用户环境：** ${userAgent}\n`;
  }

  if (stackTrace) {
    prompt += `\n**堆栈信息：**\n\`\`\`\n${stackTrace}\n\`\`\`\n`;
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    prompt += `\n**用户操作轨迹（最近 5 条）：**\n`;
    breadcrumbs.slice(-5).forEach((bc, idx) => {
      prompt += `${idx + 1}. [${bc.type}] ${bc.message} (${new Date(bc.time).toLocaleString()})\n`;
    });
  }

  prompt += `\n## 请提供以下分析

### 1. 错误根因分析
请分析这个错误的根本原因，包括：
- 错误发生的直接原因
- 可能的触发条件
- 相关的代码逻辑问题

### 2. 修复建议
请提供具体的修复方案，包括：
- 推荐的修复方法（优先级排序）
- 具体的代码示例（如果适用）
- 需要注意的边界情况

### 3. 预防措施
请建议如何预防类似错误：
- 代码层面的改进
- 测试策略
- 监控和告警建议

### 4. 严重程度评估
评估这个错误的严重程度（1-10 分）并说明理由。

请用中文回答，保持专业和简洁。`;

  return prompt;
}

export const ERROR_ANALYSIS_SYSTEM_PROMPT = `你是一个经验丰富的前端工程师和错误诊断专家。你擅长：
1. 快速定位 JavaScript 错误的根本原因
2. 提供实用的修复建议和代码示例
3. 从用户行为轨迹中发现问题线索
4. 评估错误的影响范围和严重程度

请始终保持专业、准确、简洁的回答风格。`;
