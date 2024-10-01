<template>
  <div class="sider-bar" :class="{ mini: state.isCollapse }">
    <div class="sider-fold" @click="foldHandler">
      <el-icon>
        <Fold />
      </el-icon>
    </div>
    <el-menu
      background-color="#42485b"
      text-color="#fff"
      class="sider-nav"
      unique-opened
      :collapse-transition="false"
      :default-active="state.defaultPath"
      :default-openeds="state.defaultOpen"
      :collapse="state.isCollapse"
    >
      <template v-for="(barItem, barIndex) in barList" :key="barIndex">
        <el-sub-menu :index="barItem.path" v-if="barItem.children">
          <template v-slot:title>
            <el-icon class="mficon">
              <component :is="barItem.icon"></component>
            </el-icon>
            <span class="text">{{ barItem.text }}</span>
          </template>
          <el-menu-item
            v-for="(subBarItem, subBarIndex) in barItem.children"
            :key="subBarIndex"
            :index="subBarItem.path"
            @click="activeHandle(subBarItem)"
          >
            {{ subBarItem.text }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-if="!barItem.children" :index="barItem.path" @click="activeHandle(barItem)">
          <el-icon class="mficon">
            <component :is="barItem.icon"></component>
          </el-icon>
          <template v-slot:title>
            <span class="text">{{ barItem.text }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>
<script lang="ts">
import { defineComponent, onBeforeMount, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { ElIcon, ElMenu, ElMenuItem, ElSubMenu } from 'element-plus';
import { router } from '@/route';
import { Nav } from '.';
import { DataAnalysis, Fold, FolderOpened, Postcard, Tickets } from '@element-plus/icons-vue';

export default defineComponent({
  components: {
    ElIcon,
    ElMenu,
    ElMenuItem,
    ElSubMenu,
    Fold,
    DataAnalysis,
    FolderOpened,
    Postcard,
    Tickets
  },
  setup() {
    const barList: Nav[] = [
      {
        text: '数据统计',
        icon: 'DataAnalysis',
        path: '/home/view',
        children: [
          {
            text: '基础数据',
            path: '/home/view/basic'
          }
        ]
      },
      {
        text: '项目管理',
        icon: 'FolderOpened',
        path: '/home/projects/list'
      },
      {
        text: '会话管理',
        icon: 'Postcard',
        path: '/home/session/list'
      },
      {
        text: '日志管理',
        icon: 'Tickets',
        path: '/home/log/list'
      }
    ];
    const state = reactive({
      isCollapse: false,
      defaultPath: '',
      defaultOpen: []
    });

    function foldHandler(e: MouseEvent) {
      state.isCollapse = !state.isCollapse;
      return e;
    }
    function activeHandle(c) {
      const { path } = c;
      if (path) {
        router.push(path);
      }
    }
    function initBar() {
      const { path } = useRoute();
      state.defaultPath = path;
    }
    onBeforeMount(initBar);
    return {
      barList,
      state,
      foldHandler,
      activeHandle
    };
  }
});
</script>
<style lang="scss">
.mini {
  width: 64px !important;
  .sider-fold .el-icon {
    transform: rotate(180deg);
  }
}

.sider-bar {
  width: 180px;
  height: 100%;
  background: #292d30;
  color: #fff;
  position: relative;
  text-align: center;
  user-select: none;
  font-size: 13px;
  z-index: 2;
  .sider-fold {
    height: 30px;
    background: #4a5064;
    color: #aeb9c2;
    line-height: 30px !important;
    cursor: pointer;
    .el-icon {
      font-size: 21px;
      display: inline-block;
      transition: 0.518s;
      vertical-align: middle;
    }
  }
  .sider-nav {
    border: none !important;
    text-align: left;
    .mficon {
      margin-right: 8px;
    }
    .el-sub-menu .el-menu-item {
      background: #292d30 !important;
      min-width: 100%;
    }
    .el-menu-item.is-active {
      color: #fff !important;
      background: #409eff !important;
    }
  }
}
</style>
