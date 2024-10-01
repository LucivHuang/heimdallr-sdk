<template>
  <div class="panel" :class="{ 'shadow-top': topShadow }">
    <div v-if="title" class="panel-hd">
      <h4 class="title">{{ title }}</h4>
      <span v-if="plugins.includes('more')" class="sub-text" @click="more">查看更多</span>
      <span v-if="plugins.includes('collapse')" class="sub-text" @click="collapseHandle">{{ collapse ? '展开' : '收起' }}</span>
      <slot name="header-operate"/>
    </div>
    <div class="panel-bd" :class="{ 'collapse-bd': collapse }">
      <el-icon v-if="collapse" class="collapse-bar" @click="collapseHandle"><ArrowRightBold /></el-icon>
      <slot v-else />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { ElIcon, ElMessage } from 'element-plus';
import { Plugin } from './index';
import { ArrowRightBold } from '@element-plus/icons-vue';

export default defineComponent({
  components: {
    ElIcon,
    ArrowRightBold
  },
  props: {
    title: { type: String, default: '' },
    link: { type: String, default: '' },
    plugins: { type: Array as PropType<Plugin[]>, default: () => [] },
    topShadow: { type: Boolean, default: false }
  },
  setup(props) {
    const collapse = ref(false);
    function more(e: MouseEvent) {
      const { link } = props;
      if (!link) {
        ElMessage.warning('链接地址不存在');
      }
      window.open(link);
      return e;
    }
    function collapseHandle(e: MouseEvent) {
      collapse.value = !collapse.value;
      return e;
    }
    return {
      collapse,
      more,
      collapseHandle
    };
  }
});
</script>
<style lang="scss">
.panel {
  flex: 1;
  background: #fff;
  border-radius: 3px;
  margin-bottom: 20px;
  padding: 10px;
  position: relative;
  box-shadow: 0 3px 8px 0 #dfdfdf;
  &-hd {
    margin-bottom: 12px;
    user-select: none;
    .title {
      padding-left: 12px;
      position: relative;
      margin: 0;
      display: inline;
      &:before {
        content: '';
        width: 4px;
        height: 15px;
        position: absolute;
        left: 0;
        top: 50%;
        background: #409eff;
        transform: translateY(-50%);
      }
    }
    .sub-text {
      color: #409eff;
      cursor: pointer;
      margin-left: 12px;
      font-size: 14px;
      vertical-align: middle;
    }
  }
  .collapse-bd {
    text-align: center;
    position: relative;
    height: 30px;
    overflow: hidden;
    padding: 0;
    .collapse-bar {
      transform: rotate(90deg) translateX(-50%);
      font-size: 28px;
      color: #409eff;
      position: absolute;
      left: 50%;
      animation: updown 1.5s infinite;
      cursor: pointer;
    }
  }
}
.shadow-top {
  box-shadow: 0 -3px 8px 0 #dfdfdf;
}
@keyframes updown {
  0% {
    top: 8px;
  }
  100% {
    top: 20px;
  }
}
</style>
