# @heimdallr-sdk/history

> Capture route changes, record from and to and report

## Usage

### cdn

```html
<script src="[history-dist]/history.iife.js"></script>
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
            HEIMDALLR_HISTORY(),
        ]
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import historyPlugin from "@heimdallr-sdk/history";
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
        historyPlugin(),
    ]
});
```

## 上报数据

### 日志上报

|字段名称|描述|
|-|-|
|from|跳转前地址|
|to|目标地址|
