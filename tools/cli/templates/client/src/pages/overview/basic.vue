<template>
  <div class="overview-wrap">
    <panel title="总览" class="overview-total">
      <div class="view-detail">
        <div class="view-detail-bar" v-for="bar in totalBars" :key="bar.field">
          <div class="view-detail-bar-label">{{ bar.label }}</div>
          <div class="view-detail-bar-num">
            <span class="view-detail-bar-val" :style="{ color: bar.color }">{{ formateNum(bar.value) }}</span>
            <span v-if="bar.inc" class="view-detail-bar-mark" :class="{ 'view-detail-bar-mark-inc': bar.inc > 0 }">
              <CaretTop v-if="bar.inc > 0" />
              <CaretBottom v-else />
              <div><span v-if="bar.inc > 0">+</span>{{ bar.inc }}</div>
            </span>
          </div>
        </div>
      </div>
    </panel>
    <panel v-for="proj in projList" :key="proj.id" :title="proj.name" class="view-box">
      <template #header-operate>
        <el-select class="view-option" size="small" v-model="proj.range" @change="onViewChange(proj)">
          <el-option v-for="item in viewerOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
      <div :id="`${proj.id}_chart`" class="view-chart"></div>
    </panel>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ElSelect, ElOption } from 'element-plus';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';
import panel from 'components/panel/index.vue';
import { formateNum } from 'helper/utils';
import useViewerChart from './hooks/usePerformanceChart';
import useTotalChart from './hooks/useTotalChart';

export default defineComponent({
  components: {
    panel,
    CaretTop,
    CaretBottom,
    ElSelect,
    ElOption
  },
  setup() {
    const chartColors = ['#37A2DA', '#FFDB5C', '#67E0E3', '#9FE6B8', '#32C5E9'];
    // 总览
    const { totalBars } = useTotalChart(chartColors);
    // 应用
    const { projList = [], viewerOptions, onViewChange, init } = useViewerChart(chartColors);
    onMounted(() => {
      init();
    });
    return {
      totalBars,
      formateNum,
      projList,
      viewerOptions,
      onViewChange
    };
  }
});
</script>
<style lang="scss">
.overview-wrap {
  width: calc(100% + 10px);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .overview-total {
    width: calc(100% - 10px);
    flex: unset;
    .view-detail {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-top: -12px;
      &-bar {
        flex: 1;
        text-align: center;
        line-height: 1;
        &-label {
          color: #90979c;
          font-size: 15px;
          margin-bottom: 4px;
        }
        &-num {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        &-val {
          font-size: 24px;
          font-weight: bold;
          margin-right: 4px;
          text-shadow: 0 1px #eee, 1px 0 #eee;
        }
        &-mark {
          color: #67c23a;
          margin-top: -2px;
          font-size: 12px;
          svg {
            width: 18px;
          }
          &-inc {
            color: #f56c6c;
          }
        }
      }
    }
  }
  .view-box {
    margin-top: 8px;
    margin-right: 10px;
    padding: 10px;
    flex: unset;
    .view-option {
      width: 88px;
      float: right;
    }
    .view-chart {
      width: 530px;
      height: 200px;
      clear: both;
      margin: 0 auto;
    }
    @media screen and (min-width: 1280px) and (max-width: 1366px) {
      .view-chart {
        width: 503px;
      }
    }
    @media screen and (width: 1440px) {
      .view-chart {
        width: 580px;
      }
    }
    @media screen and (width: 1680px) {
      .view-chart {
        width: 700px;
      }
    }
  }
}
</style>
