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
  <el-drawer v-model="state.isDrawerShow" :title="detail.path" size="45%">
    <div style="height: 100%; display: flex; flex-direction: column">
      <el-descriptions title="详情" :column="2" border>
        <el-descriptions-item label="用户id">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="ip地址">{{ detail.ip }}</el-descriptions-item>
        <el-descriptions-item label="语言">{{ detail.language }}</el-descriptions-item>
        <el-descriptions-item label="省份">{{ detail.province }}</el-descriptions-item>
        <el-descriptions-item label="页面标题">{{ detail.pageTitle }}</el-descriptions-item>
        <el-descriptions-item label="页面路径">{{ detail.path }}</el-descriptions-item>
        <el-descriptions-item label="窗口分辨率">{{ detail.winSize }}</el-descriptions-item>
        <el-descriptions-item label="文档分辨率">{{ detail.docSize }}</el-descriptions-item>
        <el-descriptions-item label="进入时间">{{ detail.etime }}</el-descriptions-item>
        <el-descriptions-item label="离开时间">{{ detail.ltime }}</el-descriptions-item>
        <el-descriptions-item label="userAgent">{{ detail.userAgent }}</el-descriptions-item>
      </el-descriptions>
      <br />
      <div style="flex: 1; overflow-y: scroll;">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in detail.breadcrumb" :key="index" placement="top" :timestamp="item.time">
            <el-tag effect="dark" :type="levelTypeMap[item.level]" class="mg-r-8">{{ breadcrumbTransMap[item.type] || item.type }}</el-tag>
            <el-tag :type="levelTypeMap[item.level]">{{ levelTransMap[item.level] || item.level }}</el-tag>
            <p>{{ item.message }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </el-drawer>
  <el-dialog v-model="state.isPlayerShow" class="session-play-dia" :title="detail.path" width="840px">
    <div v-if="state.isPlayerShow" id="sessionPlayWrap"></div>
  </el-dialog>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
// 组件
import { ElDrawer, ElDescriptions, ElDescriptionsItem, ElTag, ElTimeline, ElTimelineItem, ElDialog } from 'element-plus';
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
    ElTimeline,
    ElTimelineItem,
    ElDialog,
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
.session-play-dia {
  .el-dialog__header {
    border-bottom: 1px solid #eee;
  }
  #sessionPlayWrap {
    position: relative;
    width: 100%;
    .rr-player {
      float: unset !important;
    }
  }
}
</style>
