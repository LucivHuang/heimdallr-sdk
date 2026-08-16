<template>
  <header class="top-bar">
    <div class="heade-left" @click="toIndex">
      <el-icon><Watermelon /></el-icon>
      <span class="mg-l-8">监控后台</span>
    </div>
    <div class="heade-right">
      <div class="heade-user mg-l-18">
        <el-popover popper-class="user-popover" placement="bottom" trigger="hover">
          <div class="quit" @click="quitLogin">退出登录</div>
          <template #reference>
            <span class="text" v-if="userInfor.name">
              <el-icon class="mg-r-8"><Avatar /></el-icon>
              {{ userInfor.name }}
            </span>
            <span class="text" v-else>请登录</span>
          </template>
        </el-popover>
      </div>
    </div>
  </header>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { ElPopover, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus';
import { delCookie, getCookie } from 'helper/utils';
import { USER_INFOR_KEY, USER_TOKEN_KEY } from 'config/others';
import { router } from '@/route';
import { UserInfor } from '.';
import { Avatar, Watermelon } from '@element-plus/icons-vue';

export default defineComponent({
  components: {
    ElPopover,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElIcon,
    Avatar,
    Watermelon
  },
  setup() {
    let userInfor: UserInfor;
    try {
      const cookieStr = getCookie(USER_INFOR_KEY);
      userInfor = JSON.parse(cookieStr);
    } catch (error) {
      console.error(error);
    }
    userInfor = {
      born: '',
      ctime: '',
      mail: '',
      name: 'admin',
      sex: 0
    };
    function toIndex(e: MouseEvent) {
      router.push('/home');
      location.reload();
      return e;
    }
    function quitLogin(e: MouseEvent) {
      delCookie(USER_TOKEN_KEY);
      delCookie(USER_INFOR_KEY);
      router.push('/login');
      return e;
    }
    return {
      userInfor,
      toIndex,
      quitLogin
    };
  }
});
</script>
<style lang="scss">
.top-bar {
  width: 100%;
  height: 70px;
  line-height: 70px;
  background: #373d41;
  color: #fff;
  user-select: none;
  z-index: 30;
  .heade-left {
    margin-left: 8px;
    height: 70px;
    float: left;
    font-weight: 666;
    font-size: 28px;
    .el-icon {
      font-size: 32px;
      vertical-align: middle;
    }
    &:hover {
      cursor: pointer;
    }
  }
  .heade-right {
    float: right;
    height: 70px;
    font-size: 16px;
    display: flex;
    align-items: center;
    svg {
      cursor: pointer;
    }
    .heade-user {
      padding: 0 28px;
      border-left: 1px solid #2a2f32;
      border-right: 1px solid #2a2f32;
    }
  }
}
.user-popover {
  text-align: center;
  padding: 12px 0;
  .quit {
    &:hover {
      color: #409eff;
      cursor: pointer;
    }
  }
}
</style>
