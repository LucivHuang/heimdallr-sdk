# @heimdallr-sdk/wx-dom

> 捕获小程序的点击事件并上报

## Usage

```js
import heimdallr from "@heimdallr-sdk/wx";
import heimdallrWxDom from "@heimdallr-sdk/wx-dom";
const heimdallrInstance = heimdallr({
    dsn: {
        host: 'http://localhost:8888',
        init: '/project/init',
        upload: '/log/upload'
    },
    app: {
        name: 'playgroundWx',
        leader: 'test',
        desc: 'test wx proj'
    },
    plugins: [heimdallrWxDom()]
});
```
