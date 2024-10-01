<template>
  <filter-group :filters="filterFormItems" v-model="state.form" @search="loadData"></filter-group>
  <panel class="mg-t-18">
    <table-oprate class="mg-b-12" :button-grop="tableOprates" @trigger="batchHandle"></table-oprate>
    <page-table
      selectable
      :table-config="tableConfig"
      :datas="state.tableData"
      :all-items="state.allItems"
      @selected="selectHandle"
      @sort-change="sortHandle"
      @page="pageHandle"
      @operate="operateHandle"
    ></page-table>
  </panel>
  <!-- 日志详情 -->
  <el-drawer v-model="state.isDrawerShow" :title="detail.path" size="45%" @close="drawerClose">
    <el-descriptions title="详情" :column="2" border>
      <el-descriptions-item v-for="item in detail.fields" :key="item.label" :label="item.label">
        <el-tag v-if="item.label === '类型'" :type="tagTypeFilter(item.val)">{{ item.val }}</el-tag>
        <span v-else>{{ item.val }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <el-table v-if="(detail.arrayData || []).length" :data="detail.arrayData || []" stripe style="width: 100%">
      <el-table-column prop="f" label="资源地址" />
      <el-table-column prop="t" label="耗时(ms)" :width="88" />
    </el-table>
    <el-button v-if="[21, 91].includes(detail.subType)" class="mg-t-12" :loading="state.codeLoading" @click="showCode">
      {{ state.codeVisible ? '隐藏堆栈信息' : '查看堆栈信息' }}
    </el-button>
    <p v-if="[21, 91].includes(detail.subType) && !state.hasSourceMap" :style="{color:'#aaa'}">[缺少 sourceMap]</p>
    <el-timeline v-if="state.codeVisible" style="max-width: 600px" class="mg-t-12">
      <el-timeline-item v-for="(item, idx) in errorCodes" :key="idx" :timestamp="item.source || item.file" placement="top">
        <el-tag class="mg-r-8">行数：{{ item.line }}</el-tag>
        <el-tag>列数：{{ item.column }}</el-tag>
        <highlightjs v-if="item.code && item.code.length" autodetect :code="item.code" />
      </el-timeline-item>
    </el-timeline>
  </el-drawer>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
// 组件
import {
  ElDrawer,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElCard,
  ElTimeline,
  ElTimelineItem,
  ElButton,
  ElTable,
  ElTableColumn
} from 'element-plus';
// 配置
import useConfig from './hooks/useListConfig';
// 表格功能
import useTableFeature from './hooks/useListTable';

export default defineComponent({
  name: 'logList',
  components: {
    ElDrawer,
    ElDescriptions,
    ElDescriptionsItem,
    ElTag,
    ElCard,
    ElTimeline,
    ElTimelineItem,
    ElButton,
    ElTable,
    ElTableColumn,
    filterGroup: defineAsyncComponent(() => import('components/filterGroup/index.vue')),
    tableOprate: defineAsyncComponent(() => import('components/tableOprate/index.vue')),
    pageTable: defineAsyncComponent(() => import('components/pageTable/index.vue')),
    panel: defineAsyncComponent(() => import('components/panel/index.vue'))
  },
  setup() {
    // 表格功能
    const tableFeature = useTableFeature();
    const { loadData } = tableFeature;
    loadData();
    // 供模板使用
    return {
      ...useConfig(), // 引入配置
      ...tableFeature
    };
  }
});
</script>
<style lang="scss">
.source-content pre {
  padding: 8px 12px;
  border-radius: 8px;
  background: #f5f7fa;
  margin-top: 0;
}
</style>
