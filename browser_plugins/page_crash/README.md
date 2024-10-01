# @heimdallr-sdk/page-crash

[English](./README_en.md)

> 监听页面崩溃，需配合 `page_crash_worker` 使用

## Options

|配置名称|类型|是否必填|描述|默认值|
|-|-|-|-|-|
|pageCrashWorkerUrl|String|是|Web Worker脚本文件地址（pageCrash）|-|

## Usage

### cdn

```html
<script src="[page_crash-dist]/page_crash.iife.js"></script>
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
            HEIMDALLR_PAGE_CRASH({
                pageCrashWorkerUrl: '[crash-worker-dist]/page_crash_worker.iife.js'
            }),
        ],
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import page_crashPlugin from "@heimdallr-sdk/page_crash";
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
        page_crashPlugin({
            pageCrashWorkerUrl: '[crash-worker-dist]/page_crash_worker.iife.js'
        }),
    ],
});
```
