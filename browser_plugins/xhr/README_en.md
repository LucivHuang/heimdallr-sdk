# @heimdallr-sdk/xhr

> Capture XMLHttprequest request, report request header, response, and request time

## Options

|Name|Type|Describe|Default|
|-|-|-|-|-|
|ignoreUrls|Array|Filter request url|-|
|reportResponds|Boolean|whether report interface return value|false|

## Usage

### cdn

```html
<script src="[xhr-dist]/xhr.iife.js"></script>
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
            HEIMDALLR_XHR(),
        ]
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import xhrPlugin from "@heimdallr-sdk/xhr";
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
        xhrPlugin(),
    ]
});
```
