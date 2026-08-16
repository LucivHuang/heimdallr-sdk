export interface TrendPromptData {
  metricName: string;
  timeRange: string;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
  currentValue: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
  projectName?: string;
}

export function buildTrendAnalysisPrompt(data: TrendPromptData): string {
  const { metricName, timeRange, dataPoints, currentValue, avgValue, maxValue, minValue, projectName } = data;

  let prompt = `你是一个数据分析专家。请分析以下时间序列数据并提供趋势预测和异常检测。

## 数据概览

**指标名称：** ${metricName}
**时间范围：** ${timeRange}
**项目：** ${projectName || '全局'}

**统计信息：**
- 当前值: ${currentValue}
- 平均值: ${avgValue.toFixed(2)}
- 最大值: ${maxValue}
- 最小值: ${minValue}

**数据点（最近 ${dataPoints.length} 个）：**
`;

  dataPoints.forEach((point, idx) => {
    prompt += `${idx + 1}. ${point.date}: ${point.value}\n`;
  });

  prompt += `\n## 请提供以下分析

### 1. 趋势识别
请分析数据的整体趋势：
- 是上升、下降还是稳定趋势
- 趋势的强度和持续性
- 可能的周期性模式

### 2. 异常检测
请识别异常数据点：
- 哪些数据点明显偏离正常范围
- 异常的可能原因
- 异常的严重程度

### 3. 预测和建议
请提供未来趋势预测：
- 短期（1-3 天）趋势预测
- 中期（1-2 周）趋势预测
- 需要关注的风险点
- 改进建议

### 4. 告警建议
如果需要设置告警，请建议：
- 告警阈值
- 告警条件
- 告警优先级

请用中文回答，保持专业和数据驱动。`;

  return prompt;
}

export const TREND_ANALYSIS_SYSTEM_PROMPT = `你是一个经验丰富的数据分析师和时间序列分析专家。你擅长：
1. 识别数据趋势和模式
2. 检测异常值和离群点
3. 基于历史数据进行预测
4. 提供可操作的业务建议

请始终基于数据和统计方法给出客观分析。`;
