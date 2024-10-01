# @heimdallr-sdk/wx-request

> 监听小程序发起的请求，包括 request、downloadFile、uploadFile

## Options

|配置名称|类型|描述|默认值|
|-|-|-|-|
|ignoreUrls|Array|过滤请求url|-|
|reportResponds|Boolean|是否上报返回值，开启后将使用 post 上报(仍可通过reqOption修改)|false|

## Usage

```js
import heimdallr from "@heimdallr-sdk/wx";
import heimdallrWxRequest from "@heimdallr-sdk/wx-request";
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
    plugins: [heimdallrWxRequest()]
});
```
