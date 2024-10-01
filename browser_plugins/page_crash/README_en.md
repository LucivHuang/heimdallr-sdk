# @heimdallr-sdk/page-crash

> The monitoring page crashes, which needs to be used with `@heimdallr-sdk/page-crash-worker`

## Options

|Name|Type|Describe|Default|
|-|-|-|-|
|pageCrashWorkerUrl|String|Web Worker script file path|-|

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
