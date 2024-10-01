# @heimdallr-sdk/hash

> Capture the hash changes in the route, record from and to and report

## Usage

### cdn

```html
<script src="[hash-dist]/hash.iife.js"></script>
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
            HEIMDALLR_HASH(),
        ]
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import hashPlugin from "@heimdallr-sdk/hash";
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
        hashPlugin(),
    ]
});
```

## 上报数据

### 日志上报

|字段名称|描述|
|-|-|
|from|跳转前地址|
|to|目标地址|
