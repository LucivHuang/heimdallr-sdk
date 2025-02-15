# @heimdallr-sdk/performance

[English](./README_en.md)

> 浏览器性能监控插件

可获取以下指标

- Network
  - dns: DNS 解析耗时（毫秒）
  - tcp: TCP 连接耗时（毫秒）
  - ssl: SSL 安全连接耗时（毫秒）
  - ttfb: 首字节时间（Time to First Byte，毫秒）
  - trans: 数据传输耗时（毫秒）
  - redirectNum: 重定向次数
  - redirect: 重定向耗时（毫秒）
  - headerSize: HTTP 头部大小（字节）
- PageLoad
  - domParse: DOM 解析耗时（毫秒）
  - resLoad: 资源加载耗时（毫秒）
  - domReady: DOM 准备时间（毫秒）
  - load: 页面完全加载耗时（毫秒）
  - duration: 页面加载总耗时（毫秒）
- Render
  - fp: 首次绘制时间（First Paint，毫秒）
  - fcp: 首次内容绘制时间（First Contentful Paint，毫秒）
  - lcp: 最大内容绘制时间（Largest Contentful Paint，毫秒）
  - tti: 首次可交互时间（Time to Interactive，毫秒）
  - inp: 下一次绘制被阻塞时间（Interaction to Next Paint，毫秒）
  - cls: 累积布局偏移（Cumulative Layout Shift） 
  - fps: 每秒帧数（Frames Per Second） 
- Resource: 资源加载明细

## Options

|名称|类型|必填|描述|默认值|可选值|
|-|-|-|-|-|-|
|off|Array|否|停止获取某类型指标|[]|NETWORK（31）、PAGELOAD（32）、RENDER（33）、RESOURCE（34） |

## Usage

### cdn

```html
<script src="[performance-dist]/performance.iife.js"></script>
<script>
    window.__HEIMDALLR_OPTIONS__ = {
        dsn: {
            host: 'localhost:8888',
            init: '/project/init',
            upload: '/log/upload'
        },
        app: {
            name: 'playgroundAPP',
            leader: 'test',
            desc: 'test proj'
        },
        plugins: [
            HEIMDALLR_PERFORMANCE(),
        ]
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import performancePlugin from "@heimdallr-sdk/performance";
heimdallr({
    dsn: {
        host: 'localhost:8888',
        init: '/project/init',
        upload: '/log/upload'
    },
    app: {
        name: 'playgroundAPP',
        leader: 'test',
        desc: 'test proj'
    },
    plugins: [
        performancePlugin(),
    ]
});
```

## 上报数据

### 子类型

|值|描述|
|-|-|
|31|网络延迟相关|
|32|页面加载相关|
|33|首屏渲染及交互相关|
|34|资源加载明细|
