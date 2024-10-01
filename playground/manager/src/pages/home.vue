<template>
  <top-bar />
  <main class="wrap">
    <sider-bar />
    <main class="main-wrap">
      <router-view/>
    </main>
  </main>
</template>
<script setup lang="ts">
import topBar from "../components/topBar/index.vue";
import siderBar from "components/siderBar/index.vue";
</script>
<style lang='scss' scoped>
.wrap {
  height: calc(100vh - 70px);
  display: flex;
  background: #f4f6fa;
  .main-wrap {
    flex: 1;
    padding: 18px;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    .head-icon {
      width: 5px;
      height: 23px;
      display: inline-block;
      vertical-align: middle;
      border-radius: 8px;
      background: #409eff;
      margin-right: 9.9px;
    }
    .head-text {
      font-size: 1.1rem;
      font-weight: 550;
      vertical-align: middle;
    }
  }
}
</style>
