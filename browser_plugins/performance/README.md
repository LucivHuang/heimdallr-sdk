# @heimdallr-sdk/performance

[English](./README_en.md)

> 浏览器性能监控sdk

可监控以下指标

- basic
    - dnsSearch: DNS 解析耗时
    - tcpConnect: TCP 连接耗时
    - sslConnect: SSL安全连接耗时
    - request: TTFB 网络请求耗时
    - response: 数据传输耗时
    - parseDomTree: DOM 解析耗时
    - resource: 资源加载耗时
    - domReady: DOM Ready
    - httpHead: http 头部大小
    - interactive: 首次可交互时间
    - complete: 页面完全加载
    - redirect: 重定向次数
    - redirectTime: 重定向耗时
    - duration
    - fp: 渲染出第一个像素点，白屏时间
    - fcp: 渲染出第一个内容，首屏结束时间
- fmp
    - fmp: 有意义内容渲染时间
- fps
    - fps: 刷新率
- vitals
    - lcp: 最大内容渲染时间，2.5s内
    - fid: 交互性能，应小于 100ms
    - cls: 视觉稳定性，应小于 0.1
- resource
    - resource: 页面资源加载耗时

## Options

|配置名称|类型|是否必填|描述|默认值|可选值|
|-|-|-|-|-|-|
|performancOff|Array|否|关闭 performance 个别功能|[]|basic/fmp/fps/vitals/resource|

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
|31|FMP|
|32|FPS|
|33|BASIC|
|34|VITALS|
|35|RESOURCE|
