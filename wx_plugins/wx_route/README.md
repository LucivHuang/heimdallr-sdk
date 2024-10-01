# @heimdallr-sdk/wx-route

> 捕获小程序的路由跳转并上报

## Usage

```js
import heimdallr from "@heimdallr-sdk/wx";
import heimdallrWxRoute from "@heimdallr-sdk/wx-route";
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
    plugins: [heimdallrWxRoute()]
});
```
