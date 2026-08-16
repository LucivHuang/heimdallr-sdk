<template>
  <div class="ai-insights-section">
    <div class="insights-header">
      <div class="header-title">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>AI 智能洞察</span>
        <el-badge v-if="unreadCount > 0" :value="unreadCount" class="badge" />
      </div>
      <el-button size="small" @click="handleRefresh" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div v-if="loading && insights.length === 0" class="insights-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="insights.length === 0" class="insights-empty">
      <el-empty description="暂无智能洞察" />
    </div>

    <div v-else class="insights-list">
      <div
        v-for="insight in insights"
        :key="insight.id"
        class="insight-card"
        :class="{ 'is-read': insight.is_read }"
        @click="handleInsightClick(insight)"
      >
        <div class="insight-header">
          <el-tag :type="getSeverityType(insight.severity)" size="small">
            {{ getSeverityLabel(insight.severity) }}
          </el-tag>
          <span class="insight-time">{{ formatTime(insight.ctime) }}</span>
        </div>
        <div class="insight-title">{{ insight.title }}</div>
        <div class="insight-description">{{ insight.description }}</div>
        <div class="insight-footer">
          <el-tag size="small" type="info">{{ getTypeLabel(insight.type) }}</el-tag>
          <el-icon v-if="!insight.is_read" class="unread-dot">·</el-icon>
        </div>
      </div>
    </div>

    <!-- 洞察详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedInsight?.title"
      width="600px"
      @close="handleDialogClose"
    >
      <div v-if="selectedInsight" class="insight-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="类型">
            {{ getTypeLabel(selectedInsight.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityType(selectedInsight.severity)">
              {{ getSeverityLabel(selectedInsight.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时间" :span="2">
            {{ formatTime(selectedInsight.ctime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-content">
          <h4>详细分析</h4>
          <div class="analysis-content">
            {{ selectedInsight.description }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  ElButton,
  ElBadge,
  ElTag,
  ElIcon,
  ElSkeleton,
  ElEmpty,
  ElDialog,
  ElDescriptions,
  ElDescriptionsItem,
  ElMessage
} from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { aiApi, AIInsight } from '../../../api/ai';

const loading = ref(false);
const insights = ref<AIInsight[]>([]);
const dialogVisible = ref(false);
const selectedInsight = ref<AIInsight | null>(null);

const unreadCount = computed(() => {
  return insights.value.filter(i => !i.is_read).length;
});

const loadInsights = async () => {
  loading.value = true;
  try {
    const data = await aiApi.getInsights();
    insights.value = data;
  } catch (error: any) {
    ElMessage.error('加载洞察失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  loadInsights();
};

const handleInsightClick = async (insight: AIInsight) => {
  selectedInsight.value = insight;
  dialogVisible.value = true;

  if (!insight.is_read) {
    try {
      await aiApi.markInsightRead(insight.id);
      insight.is_read = true;
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
};

const handleDialogClose = () => {
  selectedInsight.value = null;
};

const getSeverityType = (severity: string) => {
  const map: Record<string, any> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  };
  return map[severity] || 'info';
};

const getSeverityLabel = (severity: string) => {
  const map: Record<string, string> = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  };
  return map[severity] || severity;
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    trend: '趋势分析',
    anomaly: '异常检测',
    recommendation: '优化建议',
    prediction: '预测'
  };
  return map[type] || type;
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
};

onMounted(() => {
  loadInsights();
});
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/theme.scss';

.ai-insights-section {
  margin-top: 16px;
  padding: 16px;
  background: $bg-white;
  border-radius: $radius-large;
  box-shadow: $shadow-light;
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
}

.ai-icon {
  width: 24px;
  height: 24px;
  color: $ai-primary;
}

.badge {
  margin-left: 4px;
}

.insights-loading,
.insights-empty {
  padding: 20px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-card {
  padding: 12px;
  background: $bg-light;
  border: 1px solid $border-lighter;
  border-radius: $radius-base;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: $ai-border;
    box-shadow: $shadow-light;
  }

  &.is-read {
    opacity: 0.7;
  }
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.insight-time {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.insight-title {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6px;
}

.insight-description {
  font-size: $font-size-sm;
  color: $text-regular;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.insight-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unread-dot {
  color: $primary-color;
  font-size: 12px;
}

.insight-detail {
  .detail-content {
    margin-top: 16px;

    h4 {
      margin-bottom: 12px;
      font-size: $font-size-md;
      color: $text-primary;
    }

    .analysis-content {
      padding: 12px;
      background: $bg-light;
      border-radius: $radius-base;
      line-height: 1.6;
      color: $text-regular;
      white-space: pre-wrap;
    }
  }
}
</style>
