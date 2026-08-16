<template>
  <div class="table-oprate">
    <el-button
      v-for="btn in buttonGrop"
      :key="btn.cmd"
      :type="btn.type"
      :round="btn.round"
      :plain="btn.plain"
      :class="btn.class"
      :style="btn.style"
      :size="btn.size"
      @click="handle(btn.cmd)"
    >
      <el-icon>
        <component :is="btn.icon"></component>
      </el-icon>
      &nbsp;
      {{ btn.label }}
    </el-button>
    <slot />
    <div class="clear"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ElButton, ElIcon } from 'element-plus';
import { OperateBtn } from '.';
import { DocumentCopy } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'tableOprate',
  components: {
    ElButton,
    ElIcon,
    DocumentCopy
  },
  props: {
    buttonGrop: {
      type: Array as PropType<OperateBtn[]>,
      default: () => []
    }
  },
  emits: ['trigger'],
  setup({ buttonGrop }, { emit }) {
    function initConfig() {
      buttonGrop.forEach((btn) => {
        const { position, style = {} } = btn;
        if (position) {
          const styleType = typeof style;
          if (styleType === 'string') {
            btn.style = `${style};float: ${position}`;
          } else if (styleType === 'object') {
            btn.style = { ...style, float: position };
          }
        }
      });
    }
    function handle(cmd: string) {
      emit('trigger', cmd);
    }
    initConfig();
    return {
      handle
    };
  }
});
</script>
<style lang="scss">
.table-oprate {
  .clear {
    clear: both;
  }
}
</style>
