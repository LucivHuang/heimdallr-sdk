# @heimdallr-sdk/page-crash-worker

> Web Worker script for page crash, which needs to be used with [@heimdallr-sdk/page-crash](https://www.npmjs.com/package/@heimdallr-sdk/page-crash)

## Usage

link: `https://cdn.jsdelivr.net/npm/@heimdallr-sdk/page-crash-worker@0.0.20/dist/page_crash_worker.iife.js`

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
            pageCrashWorkerUrl: 'https://cdn.jsdelivr.net/npm/@heimdallr-sdk/page-crash-worker@0.0.20/dist/page_crash_worker.iife.js'
        }),
    ],
});
```

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
                pageCrashWorkerUrl: 'https://cdn.jsdelivr.net/npm/@heimdallr-sdk/page-crash-worker@0.0.20/dist/page_crash_worker.iife.js'
            }),
        ],
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```
