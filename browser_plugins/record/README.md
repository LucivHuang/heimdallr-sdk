# @heimdallr-sdk/record

> Record all actions in the current session

## Usage

rrweb config ☞ [rrweb guide](https://github.com/rrweb-io/rrweb/blob/master/guide.zh_CN.md)

### cdn

```html
<script src="[record-dist]/record.iife.js"></script>
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
            HEIMDALLR_RECORD([rrweb config]),
        ]
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import recordPlugin from "@heimdallr-sdk/record";
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
        recordPlugin([rrweb config]),
    ]
});
```
