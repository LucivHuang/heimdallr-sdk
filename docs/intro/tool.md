# 工具

> heimdallr-sdk — 首创插件化、可插拔的前端埋点 SDK，以下工具链助力快速集成与部署。

## @heimdallr-sdk/cli

heimdallr-sdk 的脚手架工具

主要作用就是为了能够快速部署”监控服务端”与”监控管理后台”

全局安装脚手架

```bash
npm i @heimdallr-sdk/cli -g
```

安装完成后输入 `heimdallr-create` 命令，即可开始选择相应的模板

![命令提示行](./heimdallr-cli.png)

提供”监控后台管理台”和”监控服务”以及”带消息队列的监控服务” 三类模板

依次完成配置（作答），在当前目录下将自动创建项目文件夹

![创建成功](./heimdallr-cli-result.png)

三个模板前文已经介绍了，这里就不再赘述了

## E2E 测试套件

基于 Playwright 构建的完整端到端测试框架，覆盖 SDK 核心功能、所有插件以及管理后台集成。

### 测试架构

测试框架采用分层架构设计：

- **全局设置 (Global Setup)**：数据库初始化、服务启动、SDK 构建
- **测试执行 (Test Execution)**：64 个测试用例，覆盖所有功能模块
- **全局清理 (Global Teardown)**：服务停止、数据清理、资源释放

### 测试覆盖范围

#### 核心功能测试
- SDK 初始化与项目注册
- 会话管理与跟踪
- 日志上报与接收
- 面包屑累积机制

#### 插件测试
- **错误捕获**：TypeError、ReferenceError、Promise 拒绝、堆栈跟踪
- **控制台监控**：console.log/error/warn 拦截与上报
- **DOM 事件**：点击事件捕获、坐标记录、选择器生成、节流控制
- **网络请求**：XHR 与 Fetch 拦截、时序统计、状态码记录
- **性能监控**：页面加载指标、网络时序、渲染指标、资源时序
- **路由监控**：Hash 路由与 History 路由变化捕获
- **页面崩溃**：基于 WebWorker 的崩溃检测
- **录屏回放**：用户行为录制与事件时间戳
- **Vue 集成**：Vue 错误捕获、钩子信息记录
- **自定义事件**：HEIMDALLR_REPORT API 自定义上报

#### 集成测试
- 管理后台登录流程
- 页面导航与路由切换
- 报告接收与验证
- 数据结构完整性校验

### 快速开始

**前置要求**
- MySQL 运行在 localhost:3306，数据库 `test_base`
- Node.js >= 16，pnpm >= 9.7.1

**首次设置**

```bash
# 安装依赖
pnpm install

# 设置测试环境（生成 Prisma 客户端 + 安装 Playwright 浏览器）
pnpm test:setup

# 创建测试数据库（如果不存在）
mysql -u root -p -e “CREATE DATABASE IF NOT EXISTS test_base;”
```

**运行测试**

```bash
# 运行所有 E2E 测试
pnpm test

# 使用 Playwright UI（交互模式）
pnpm test:e2e:ui

# 调试模式
pnpm test:e2e:debug

# 有界面模式（可见浏览器）
pnpm test:e2e:headed

# 查看测试报告
pnpm test:e2e:report
```

### 测试结构

```
e2e/
├── config/
│   └── playwright.config.ts       # Playwright 配置
├── fixtures/
│   ├── database.ts                # 数据库助手
│   └── services.ts                # 服务编排器
├── helpers/
│   ├── port-manager.ts            # 端口分配
│   ├── report-interceptor.ts      # 报告拦截
│   └── service-health.ts          # 健康检查
├── setup/
│   ├── global-setup.ts            # 测试前置设置
│   └── global-teardown.ts         # 测试后置清理
└── tests/
    ├── integration/               # 集成测试
    │   ├── demo-page.spec.ts     # Demo 页面测试
    │   ├── manager.spec.ts       # 管理后台测试
    │   └── mock-app.spec.ts      # 模拟应用测试
    └── plugins/                   # 插件测试
        ├── console.spec.ts        # 控制台插件
        ├── customer.spec.ts       # 自定义事件
        ├── dom.spec.ts           # DOM 事件
        ├── errors.spec.ts        # 错误捕获
        ├── fetch.spec.ts         # Fetch 请求
        ├── page-crash.spec.ts    # 页面崩溃
        ├── performance.spec.ts   # 性能监控
        ├── record.spec.ts        # 录屏回放
        ├── routing.spec.ts       # 路由监控
        ├── vue.spec.ts           # Vue 集成
        └── xhr.spec.ts           # XHR 请求
```

### 工作原理

1. **全局设置阶段**
   - 连接数据库并推送 Prisma schema
   - 清理旧测试数据并植入种子数据
   - 构建所有 SDK 包
   - 启动服务（server:8001, mock_app:5173, manager:5174）

2. **测试执行阶段**
   - 测试按顺序执行（workers: 1）
   - 每个测试可拦截并验证上报数据
   - 服务在测试间保持运行

3. **全局清理阶段**
   - 停止所有服务
   - 清理测试数据
   - 断开数据库连接

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Setup MySQL
  run: |
    sudo systemctl start mysql
    mysql -u root -proot -e “CREATE DATABASE test_base;”

- name: Install dependencies
  run: pnpm install

- name: Run E2E tests
  run: pnpm test
```

详细的故障排查指南，请参考 [e2e/README.md](../../e2e/README.md)

## @heimdallr-sdk/webpack-plugin-sourcemap-upload

这个插件，件如其名（狗头），主要功能就是在以 webpack 为构建工具的项目中完成 sourcemap 文件的上传

在 webpack 构建完成后，将产出的 sourcemap 文件自动上传到指定服务器

用法也简单，指定一下初始化 sdk 时的应用名称，以及文件上传的接口地址即可

```js
import UploadSourceMapPlugin from "@heimdallr-sdk/webpack-plugin-sourcemap-upload";
const config = {
  plugins: [
    new UploadSourceMapPlugin({
      app_name: "playground",
      url: `http://localhost:8001/sourcemap/upload`,
    }),
  ],
};
```

## @heimdallr-sdk/vite-plugin-sourcemap-upload

这个插件功能同上，不同点在于，上一个插件是针对以 webpack 为构建工具的项目，而这个插件是针对以 vite 为构建工具的项目

同样是在 vite 构建完成后，将产出的 sourcemap 文件自动上传到指定服务器

因为 vite 底层其实是使用 rollup 构建，因此，该插件监听的是 writeBundle 和 closeBundle 两个阶段的 hook

用法如下

```js
import sourceMapUpload from "@heimdallr-sdk/vite-plugin-sourcemap-upload";

export default defineConfig({
  plugins: [
    vue(),
    sourceMapUpload({
      app_name: "playground",
      url: `http://localhost:8001/sourcemap/upload`,
    }),
  ],
  build: {
    sourcemap: true,
  },
});
```

使用时需要注意的是，@heimdallr-sdk/webpack-plugin-sourcemap-upload 对外暴露的是一个类，而 @heimdallr-sdk/vite-plugin-sourcemap-upload 对外暴露的则是一个函数
