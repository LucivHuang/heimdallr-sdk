<template>
  <table-view
    :config="tableConfig"
    :data="state.tableData"
    :tableclass="tableclass"
    :filter-map="filterMap"
    :selectable="selectable"
    @select-change="selectHandle"
    @sort-change="sortHandle"
    @operate="operateHandle"
  >
    <template #poster="scope">
      <el-popover trigger="hover" placement="right" popper-class="popover-img">
        <img :src="scope.row.poster" />
        <!-- <img :src="scope.row.poster" @error="picerr($event)" /> -->
        <template #reference>
          <img class="table-img" :src="scope.row.poster" />
          <!-- <img class="table-img" @error="picerr($event)" :src="scope.row.poster" /> -->
        </template>
      </el-popover>
    </template>
  </table-view>
  <div class="pagger" v-if="pagger">
    <span class="all-page">
      共
      {{ allItems }}
      条数据
    </span>
    <el-pagination
      background
      @current-change="currentChangeHandle"
      @size-change="sizeChangeHandle"
      :page-size="state.pageSize"
      :page-sizes="pageSizes"
      :layout="pageConfig.join(',')"
      :total="allItems"
    ></el-pagination>
  </div>
</template>
<script lang="ts">
import { defineComponent, watch, reactive, PropType } from 'vue';
import { ElPopover, ElPagination } from 'element-plus';
import { DEFAULT_PAGE_SIZE } from 'config/others';
import { picerr } from 'helper/utils';
import tableView from 'components/tableView/index.vue';
import { ColumnConfig } from 'components/tableView/index';

export default defineComponent({
  components: {
    tableView,
    ElPopover,
    ElPagination
  },
  props: {
    pagger: {
      type: Boolean,
      default: true
    },
    allItems: {
      type: Number,
      default: 0
    },
    pageConfig: {
      type: Array,
      default: () => ['sizes', 'prev', 'pager', 'next']
    },
    pageSizes: {
      type: Array as PropType<number[]>,
      default: () => [20, 50, 100]
    },
    tableclass: {
      type: String,
      default: ''
    },
    tableConfig: {
      type: Array as PropType<ColumnConfig[]>,
      default: () => []
    },
    filterMap: {
      type: Object,
      default: () => ({})
    },
    selectable: {
      type: Boolean,
      default: false
    },
    datas: {
      type: Array,
      default: () => []
    }
  },
  emits: ['page', 'selected', 'sortChange', 'operate'],
  setup(props, { emit }) {
    const state = reactive({
      tableData: [],
      pageSize: DEFAULT_PAGE_SIZE
    });
    watch(
      () => props.datas,
      (val) => {
        state.tableData = val;
      },
      { immediate: true }
    );
    // 分页
    let pageIndex = 1;
    function currentChangeHandle(val) {
      pageIndex = val;
      pageEmit();
    }
    function sizeChangeHandle(val) {
      state.pageSize = val;
      pageIndex = 1;
      pageEmit();
    }
    function pageEmit() {
      emit('page', {
        pindex: pageIndex,
        psize: state.pageSize
      });
    }
    // 操作按钮点击事件
    function operateHandle(cmd, row) {
      emit('operate', cmd, row);
    }
    // 选择框
    function selectHandle(arr) {
      emit('selected', arr);
    }
    // 排序
    function sortHandle(val) {
      emit('sortChange', val);
    }
    return {
      state,
      currentChangeHandle,
      sizeChangeHandle,
      operateHandle,
      selectHandle,
      sortHandle,
      picerr
    };
  }
});
</script>
<style lang="scss">
.table-img {
  width: 88px;
}
.pagger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  user-select: none;
  .all-page {
    color: #aaa;
    font-size: 14px;
  }
}
.popover-img {
  width: auto !important;
  img {
    max-width: 500px;
    min-width: 150px;
    max-height: 400px;
    display: block;
  }
}
</style>
