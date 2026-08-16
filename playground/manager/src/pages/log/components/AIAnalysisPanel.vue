<template>
  <div class="ai-analysis-panel">
    <div class="ai-header">
      <div class="ai-title">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>AI 智能分析</span>
      </div>
      <el-button
        v-if="!analysis"
        type="primary"
        size="small"
        :loading="loading"
        @click="handleAnalyze"
      >
        {{ loading ? '分析中...' : '开始分析' }}
      </el-button>
      <el-tag v-else size="small" type="success">
        <el-icon><Check /></el-icon>
        已分析
      </el-tag>
    </div>

    <div v-if="error" class="ai-error">
      <el-alert type="error" :closable="false">
        {{ error }}
      </el-alert>
    </div>

    <div v-if="analysis" class="ai-content">
      <div class="ai-section">
        <div class="section-header">
          <el-icon class="section-icon"><Warning /></el-icon>
          <span class="section-title">严重程度</span>
        </div>
        <div class="severity-bar">
          <el-progress
            :percentage="analysis.details.severity * 10"
            :color="getSeverityColor(analysis.details.severity)"
            :stroke-width="12"
          />
          <span class="severity-text">{{ analysis.details.severity }}/10</span>
        </div>
      </div>

      <div class="ai-section">
        <div class="section-header">
          <el-icon class="section-icon"><Search /></el-icon>
          <span class="section-title">根因分析</span>
        </div>
        <div class="section-content">
          {{ analysis.details.rootCause || '暂无分析结果' }}
        </div>
      </div>

      <div class="ai-section">
        <div class="section-header">
          <el-icon class="section-icon"><Tools /></el-icon>
          <span class="section-title">修复建议</span>
        </div>
        <div class="section-content">
          <ul class="suggestion-list">
            <li v-for="(suggestion, idx) in analysis.details.fixSuggestions" :key="idx">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>

      <div class="ai-section">
        <div class="section-header">
          <el-icon class="section-icon"><HelpFilled /></el-icon>
          <span class="section-title">预防措施</span>
        </div>
        <div class="section-content">
          {{ analysis.details.prevention || '暂无建议' }}
        </div>
      </div>

      <div class="ai-meta">
        <el-tag size="small" type="info">
          {{ analysis.metadata.provider }} / {{ analysis.metadata.model }}
        </el-tag>
        <el-tag v-if="analysis.cached" size="small" type="warning">
          <el-icon><Clock /></el-icon>
          缓存结果
        </el-tag>
        <span class="confidence">置信度: {{ (analysis.confidence * 100).toFixed(0) }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElButton, ElTag, ElAlert, ElProgress, ElIcon, ElMessage } from 'element-plus';
import { Check, Warning, Search, Tools, HelpFilled, Clock } from '@element-plus/icons-vue';
import { aiApi, AIAnalysisResult } from '../../../api/ai';

const props = defineProps<{
  logId: string;
}>();

const loading = ref(false);
const error = ref('');
const analysis = ref<AIAnalysisResult | null>(null);

const handleAnalyze = async () => {
  loading.value = true;
  error.value = '';

  try {
    const result = await aiApi.analyzeError(props.logId);
    analysis.value = result;
    ElMessage.success('分析完成');
  } catch (err: any) {
    error.value = err.message || '分析失败，请稍后重试';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

const getSeverityColor = (severity: number) => {
  if (severity >= 8) return '#F56C6C';
  if (severity >= 5) return '#E6A23C';
  return '#67C23A';
};
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/theme.scss';

.ai-analysis-panel {
  margin-top: 16px;
  padding: 16px;
  background: $ai-bg;
  border: 1px solid $ai-border;
  border-radius: $radius-large;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $ai-primary;
}

.ai-icon {
  width: 24px;
  height: 24px;
  color: $ai-primary;
}

.ai-error {
  margin-bottom: 16px;
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-section {
  background: $bg-white;
  padding: 12px;
  border-radius: $radius-base;
  border: 1px solid $border-lighter;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 600;
  color: $text-primary;
}

.section-icon {
  color: $ai-primary;
}

.section-content {
  color: $text-regular;
  line-height: 1.6;
  white-space: pre-wrap;
}

.severity-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.severity-text {
  font-weight: 600;
  color: $text-primary;
  min-width: 40px;
}

.suggestion-list {
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 8px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.ai-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid $border-lighter;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.confidence {
  margin-left: auto;
  font-weight: 500;
}
</style>
