<template>
  <el-select
    v-model="state.input"
    :multiple="multiple"
    :placeholder="placeholder || '请选择'"
    filterable
    clearable
    remote
    :disabled="disabled"
    :loading="state.loading"
    :remote-method="remoteMethod()"
    @focus="remoteMethod($event)"
    @change="changeHandle"
  >
    <el-option
      v-for="(option, index) in state.options || []"
      :key="`${option.value}_${index}`"
      :label="option.label"
      :value="option.value"
    >
    </el-option>
  </el-select>
</template>
<script lang="ts">
import { defineComponent, PropType, reactive, watch } from "vue";
import { ElSelect, ElOption } from "element-plus";
import { parseValueByPath } from "helper/utils";
import http from "helper/http";
import { InputConfig } from ".";

export default defineComponent({
  components: {
    ElSelect,
    ElOption,
  },
  props: {
    modelValue: { default: "" },
    config: { type: Object as PropType<InputConfig> },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
  },
  emits: ["update:modelValue", "input","change"],
  setup(props, { emit }) {
    let state = reactive({ input: "", options: [], loading: false });

    function changeHandle() {
      emit("update:modelValue", state.input);
      emit("input", state.input);
      emit("change", state.input);
    }

    function remoteMethod(event?) {
      if (event) {
        const query = event.srcElement.value;
        if (!query) {
          searchFunction(query); // focus展开一个空的查询
        }
      } else {
        return searchFunction; // 搜索的时候
      }
    }
    function searchFunction(query: string, paramKey?: string) {
      state.loading = true;
      const { config = {} } = props;
      const {
        method = 'get',
        searchKey,
        defaultParam = {},
        url: configUrl,
      } = config as InputConfig;
      let resultKey = searchKey;
      // 筛选配置
      if (paramKey && query) {
        resultKey = paramKey;
      }
      // 请求配置
      let param = "";
      Object.keys(defaultParam).forEach((key) => {
        const val = defaultParam[key];
        if (val) {
          param += `&${key}=${val}`;
        }
      });
      if (query) {
        param += `&${resultKey}=${query}`;
      }
      const url = `${configUrl}${
        configUrl.indexOf("?") === -1 ? "?" : ""
      }${param}`;
      switch (method) {
        case "jsonp":
          http.jsonp(url).then(({ data }) => {
            remoteResponseHandle(data);
          });
          break;
        case "get":
          http.get(url).then((data) => {
            remoteResponseHandle(data);
          });
          break;
        default:
          state.loading = false;
          break;
      }
    }

    function remoteResponseHandle(res) {
      state.loading = false;
      const { config = {} } = props;
      const {
        targetPath = "",
        idKey = "",
        nameKey = "",
        showId,
      } = config as InputConfig;
      const targetData = parseValueByPath(res, targetPath);
      if (!targetData || !(targetData instanceof Array)) {
        return;
      }
      const map = targetData.map((obj) => {
        let remark = "";
        if (obj.remark) {
          remark += `[备注:${obj.remark}]`;
        }
        const option = {
          label: showId ? `${obj[idKey]} - ${obj[nameKey]}` : obj[nameKey],
          value: obj[idKey],
          remark,
        };
        return option;
      });
      state.options = map;
    }

    watch(
      () => props.modelValue,
      (val) => {
        state.input = val;
        if (Array.isArray(val)) {
          val.forEach((id) => {
            searchFunction(id, "id");
          });
        } else {
          searchFunction(val, "id");
        }
      },
      { immediate: true }
    );
    return {
      state,
      changeHandle,
      remoteMethod,
    };
  },
});
</script>
