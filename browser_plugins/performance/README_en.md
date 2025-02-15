# @heimdallr-sdk/performance

> Browser performance monitoring sdk

The following indicators can be monitored

## Options

|Name|Type|Describe|Optional|Default|
|-|-|-|-|-|
|off|Array|Turn off individual performance functions|NETWORK（31）、PAGELOAD（32）、RENDER（33）、RESOURCE（34） |[]|

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
