<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import cn from "element-plus/lib/locale/lang/zh-cn";

export default defineComponent({
  components: {
    ElConfigProvider,
  },
  setup() {
    return {
      locale: cn,
    };
  },
});
</script>
