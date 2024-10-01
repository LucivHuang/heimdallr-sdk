<template>
  <el-popover popper-class="copy-popover" placement="bottom-start" :visible="show">
    <p class="copy-popover-tip">
      <el-icon class="success-icon"><CircleCheck /></el-icon>
      已复制成功，可使用快捷键 CTRL+V 粘贴
    </p>
    <template #reference>
      <el-icon class="copy-btn" @click="handleClick"><DocumentCopy /></el-icon>
    </template>
  </el-popover>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { ElPopover, ElIcon } from 'element-plus';
import { copy as copyFunc } from 'helper/utils';
import { CircleCheck, DocumentCopy } from '@element-plus/icons-vue';

export default defineComponent({
  components: {
    ElPopover,
    ElIcon,
    CircleCheck,
    DocumentCopy
  },
  props: {
    duration: { type: Number, default: 2000 },
    copy: { type: String, default: '' },
    callback: { default: null }
  },
  setup({ callback, duration, copy }) {
    const show = ref(false);
    let timmerId = 0;
    watch(show, (value) => {
      if (!value) {
        window.clearTimeout(timmerId);
      }
    });
    function handleClick() {
      if (typeof callback === 'function') {
        callback();
        return;
      }
      copyFunc(copy);
      successHandle();
    }
    function successHandle() {
      show.value = true;
      if (show.value) {
        timmerId = window.setTimeout(() => {
          show.value = false;
        }, duration);
      }
    }
    return {
      show,
      handleClick
    };
  }
});
</script>
<style lang="scss">
.copy-btn {
  vertical-align: middle;
  color: #409eff;
  font: {
    weight: bold;
    size: 15px;
  }
  &:hover {
    color: #79bcff;
    cursor: pointer;
  }
}
.copy-popover {
  width: auto !important;
  &-tip {
    white-space: nowrap;
    display: flex;
    align-items: center;
    margin: 0;
    .success-icon {
      margin-right: 5px;
      color: #67c23a;
      font: {
        size: 16px;
        weight: bold;
      }
    }
  }
}
</style>
