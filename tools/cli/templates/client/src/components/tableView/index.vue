<template>
  <el-table
    class="table-view"
    :ref="tableName"
    :id="tableName"
    :data="state.tableData"
    :class="tableclass"
    :row-key="rowKey"
    :border="border"
    empty-text="暂无数据"
    @selection-change="handleSelectionChange"
    @sort-change="sortChange"
  >
    <template v-if="selectable">
      <el-table-column type="selection" class-name="select-box" width="35">
      </el-table-column>
    </template>
    <el-table-column
      v-for="(column, index) in state.config"
      :key="index"
      :prop="column.prop"
      :width="column.width"
      :align="column.align || 'center'"
      :class-name="column.cusClass"
      :min-width="column.minWidth"
      :sortable="column.sortable"
    >
      <!-- 表头 -->
      <template #header="scope">
        <template v-if="column.headerSlot">
          <slot
            :name="`header-${column.prop}`"
            :value="scope.row[column.prop]"
            :row="scope.row"
            :index="scope.$index"
          >
          </slot>
        </template>
        <template v-else>
          {{ column.label }}
        </template>
      </template>
      <!-- 列 -->
      <template v-slot="scope">
        <!-- 插槽 -->
        <template v-if="column.type == 'slot'">
          <slot
            :name="column.prop"
            :value="scope.row[column.prop]"
            :row="scope.row"
            :index="scope.$index"
          >
          </slot>
        </template>
        <!-- 操作栏 -->
        <template v-else-if="column.type == 'operation'">
          <div class="operate-btn-group">
            <el-button
              v-for="(btn, idx) in column.operates"
              :key="idx"
              link
              class="opera-btn"
              :style="operateBtnStyleFilter(btn, scope.row)"
              :class="btn.class"
              :size="btn.size"
              :disabled="!enableBtn(btn.condition || {}, scope.row)"
              @click="operateHandle(btn.cmd, scope.row)"
              >{{ btn.label }}</el-button
            >
          </div>
        </template>
        <template v-else>
          <!-- 静态翻译 -->
          <span
            :class="column.cusClass"
            :style="styleFilter(column, scope.row)"
          >
            {{ textFilter(column, scope.row) }} </span
          >&nbsp;
          <!-- 一键复制 -->
          <copy-pop
            v-if="hasPlugins(column, 'copy')"
            cus-icon-class="mg-r-5"
            :copy="`${scope.row[column.prop]}`"
          />
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts">
import {
  defineComponent,
  watch,
  reactive,
  onMounted,
  PropType,
  defineAsyncComponent,
} from "vue";
import Sortable from "sortablejs";
import { ElTable, ElTableColumn, ElButton } from "element-plus";
import { cusToRefs } from "helper/utils";
import useFilter from "./hooks/useFilter";
import useTranslate from "./hooks/useTranslate";

export default /*#__PURE__*/ defineComponent({
  components: {
    ElTable,
    ElTableColumn,
    ElButton,
    copyPop: defineAsyncComponent(() => import("components/copyPop/index.vue")),
  },
  props: {
    tableclass: { type: String, default: "recommand-table" },
    tableName: { type: String, default: "refTable" },
    config: {
      type: Array as PropType<ColumnConfig[]>,
      required: true,
      default: () => [],
    },
    selectable: { type: Boolean, default: false },
    sortable: { type: Boolean, default: false },
    data: { type: Array, default: () => [] },
    rowKey: { type: String, default: "" },
    border: { type: Boolean, default: true },
    filterMap: { type: Object, default: () => ({}) },
  },
  emits: ["drag-on-end", "operate", "select-change", "sort-change", "refresh"],
  setup(props, { emit }) {
    // 处理表格数据
    const state = reactive({
      tableData: [],
      config: [],
    })
    watch(
      () => props.data,
      (val) => {
        initData(val);
      },
      { immediate: true }
    );
    // 处理表格栏
    watch(
      () => props.config,
      (val) => {
        state.config = val;
      },
      { immediate: true }
    );
    // 自动计算操作栏宽度
    function updateOperationColumn() {
      const { config } = props;
      const fontSize = 14; // 字体大小
      const btnGap = 10; // 间隔
      const fontBorder = 2;
      const padding = 8;
      const minWidth = 58; // 最小宽度
      const targetIndex = config.findIndex(({ type }) => type === "operation");
      if (targetIndex !== -1) {
        const target = config[targetIndex];
        const {
          minWidth: customMinWidth,
          width: customWidth,
          operates = [],
        } = (target as ColumnConfig) || {};
        if (customMinWidth || customWidth) {
          // 用户已自定义宽度
          state.config = config;
          return;
        }
        let width = 0;
        operates.forEach(({ label }) => {
          width += label.length * fontSize + fontBorder + btnGap + padding;
        });
        if (width === 0) {
          state.config = config.slice(0, targetIndex);
          return;
        }
        target.width = width < minWidth ? minWidth : width;
      }
      state.config = config;
    }
    // 判断是否使用插件
    function hasPlugins(column: ColumnConfig, feature: string): boolean {
      const { plugins = [] } = column;
      return plugins.includes(feature);
    }
    // 按钮是否可用
    function enableBtn(condition: BtnCondition, row): boolean {
      if (Object.keys(condition).length > 0) {
        const { prop = "", values = [], cmd } = condition;
        switch (cmd) {
          case 'notempty':
            return row[prop];
          case 'empty':
            return !row[prop];
          default:
            break;
        }
        return values.includes(row[prop]);
      }
      return true;
    }
    // 初始化表格数据
    function initData(val) {
      const translateArr = props.config.filter((column) =>
        hasPlugins(column, "translate")
      );
      if (translateArr.length) {
        translateHandle(translateArr, val);
      } else {
        state.tableData = val;
      }
    }
    function translateHandle(translateArr: Array<ColumnConfig>, val) {
      const { remoteTranslate } = useTranslate();
      state.tableData = val.map((ele) => {
        translateArr.forEach(({ prop, config: { translate } }) => {
          remoteTranslate({ prop, ...translate }, ele);
        });
        return ele;
      });
    }
    // 操作按钮点击事件
    function operateHandle(cmd: string, row) {
      emit("operate", cmd, cusToRefs(row));
    }
    // 复选框
    function handleSelectionChange(val) {
      const results = val.reduce((pre, cur) => {
        pre.push(cusToRefs(cur));
        return pre;
      }, []);
      emit("select-change", results);
    }
    // 列排序
    function sortChange(params) {
      const { prop: sortProp, order } = params;
      if (!sortProp && !order) {
        emit("sort-change", {});
        return;
      }
      let result = params;
      const target: ColumnConfig = props.config.find(
        ({ prop }) => prop === sortProp
      );
      if (target) {
        const { ascVal, descVal, orderParam, sortParam, sortVal } =
          target.config;
        switch (order) {
          case "ascending":
            result.order = ascVal;
            break;
          case "descending":
            result.order = descVal;
            break;
          default:
            break;
        }
        result.orderParam = orderParam;
        result.sortParam = sortParam;
        result.sortVal = sortVal;
      }
      emit("sort-change", result);
    }
    // 刷新
    function onRfresh() {
      emit("refresh");
    }
    // 生命周期-挂载完成
    onMounted(() => {
      updateOperationColumn();
      // 拖拽
      if (props.sortable) {
        const el = document.querySelectorAll(
          `#${props.tableName}>.el-table__body-wrapper > table > tbody`
        )[0];
        Sortable.create(el, {
          onEnd: ({ newIndex, oldIndex }) => {
            const target = state.tableData[oldIndex];
            emit("drag-on-end", { target, newIndex, oldIndex });
          },
        });
      }
    });
    return {
      state,
      hasPlugins,
      enableBtn,
      operateHandle,
      handleSelectionChange,
      sortChange,
      onRfresh,
      ...useFilter(props, enableBtn, hasPlugins),
    };
  },
});
</script>
<style lang="scss">
.table-view {
  width: 100%;
  margin-top: 18px;
  user-select: none;
  .el-table__header-wrapper th {
    color: #212121;
    background-color: #eff5ff;
  }
  .operate-btn-group {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    user-select: none;
    .opera-btn {
      margin-bottom: 8px;
      color: #409eff;
      &.is-disabled {
        color: #a8abb2;
      }
    }
  }
}
</style>
