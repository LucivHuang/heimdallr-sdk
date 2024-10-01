# @heimdallr-sdk/dom

> Capture dom click events and report

## Options

|Name|Type|Required|Describe|Default|
|-|-|-|-|-|
|throttleDelayTime|Number|No|Throttling threshold (ms)|300|

## Usage

### cdn

```html
<script src="[dom-dist]/dom.iife.js"></script>
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
            HEIMDALLR_DOM({
                throttleDelayTime: 300 // 非必填
            }),
        ],
        debug: true
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import domPlugin from "@heimdallr-sdk/dom";
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
        domPlugin(),
    ]
});
```
