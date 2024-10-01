// 导入首页
import Index from "./page/index";
// 导入登录页
import Login from "./page/login";

// 配置路由映射 （不同的路由对应渲染不同的页面组件）
const router = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default router;
