<template>
  <el-select
    popper-class="select-box"
    v-model="input"
    :multiple="multiple"
    :placeholder="placeholder || '请选择'"
    clearable
    :filterable="filterable"
    :disabled="readonly"
    @change="changeHandle"
  >
    <el-checkbox class="select-all-check" v-if="all" v-model="allChecked">
      {{ allChecked ? '取消全选' : '全选' }}
    </el-checkbox>
    <el-option
      v-for="select in optionsProxy.localOptions || []"
      :key="select.value"
      :label="select.label"
      :value="select.value"
    >
    </el-option>
  </el-select>
</template>
<script lang="ts">
import {
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  watch,
} from "vue";
import { ElSelect, ElOption, ElCheckbox } from "element-plus";
import { Option } from "helper/types";
import http from "helper/http";
import { OptionConfig } from "./index";

export default defineComponent({
  components: {
    ElSelect,
    ElCheckbox,
    ElOption,
  },
  props: {
    value: { default: "" },
    multiple: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    all: { type: Boolean, default: false },
    options: { type: Array as PropType<Option[]>, default: () => [] },
    optionConfig: {
      type: Object as PropType<OptionConfig>,
      default: () => ({}),
    },
  },
  emits: ["input", "change"],
  setup(props, { emit }) {
    let input = ref<string | Option[]>("");
    watch(
      () => props.value,
      (val) => {
        input.value = val;
      },
      { immediate: true }
    );

    let allChecked = ref(false);
    let optionsProxy = reactive({
      localOptions: [],
    });
    watch(allChecked, () => {
      if (props.multiple) {
        if (allChecked) {
          input.value = optionsProxy.localOptions.map((ele) => ele.value);
        } else {
          if (input.value.length === optionsProxy.localOptions.length) {
            input.value = [];
          }
        }
        emit("input", input.value);
        emit("change", input.value);
      }
    });

    // 是否配置了选项
    function hasStaticOptions() {
      return Array.isArray(props.options) && props.options.length > 0;
    }
    // 是否勾选了全部选项
    function checkAll() {
      allChecked.value =
        input.value.length === optionsProxy.localOptions.length;
    }

    // 初始化
    function init() {
      if (!hasStaticOptions() && Object.keys(props.optionConfig).length > 0) {
        const { url } = props.optionConfig as OptionConfig;
        if (url) {
          http.get(url).then((data) => {
            responseHandle(data);
          });
        }
      } else {
        optionsProxy.localOptions = props.options;
      }
      input.value = props.value;
      checkAll();
    }
    function responseHandle(res) {
      const { targetPath, nameKey, idKey } = props.optionConfig as OptionConfig;
      if (!res[targetPath] || !Array.isArray(res[targetPath])) {
        return;
      }
      const map = res[targetPath].map((obj) => {
        let remark = "";
        if (obj.remark) {
          remark += `[备注:${obj.remark}]`;
        }
        return {
          label: obj[nameKey],
          value: obj[idKey],
        };
      });
      optionsProxy.localOptions = map;
      checkAll();
    }
    function changeHandle() {
      checkAll();
      emit("input", input.value);
      emit("change", input.value);
    }
    // 生命周期-挂载完成
    onMounted(init);
    return {
      input,
      allChecked,
      optionsProxy,
      changeHandle,
    };
  },
});
</script>
<style lang="scss">
.select-box .select-all-check {
  display: flex;
  height: 34px;
  padding: 0 20px;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  .el-checkbox__label {
    line-height: unset;
    padding-left: 0;
    font-weight: 550;
  }
}
</style>
