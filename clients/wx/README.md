# @heimdallr-sdk/wx

> 微信小程序监控基座，内置错误捕获sdk

默认使用 get 上报，允许修改 `wx.request` 配置项（不可修改 data、dataType）

## Options

|配置名称|类型|描述|可选值|默认值|
|-|-|-|-|-|
|dsn|Object|上报接口配置信息|DSN|-|
|app|Object|应用信息|APPInfo|-|
|enabled|Boolean|是否向后台发送事件|true/false|true|
|plugins|Array|插件集合|-|-|
|debug|Boolean|控制台是否显示报错|true/false|false|
|reqOption|(rs,rj) => RequestOption|请求配置项（最高优先级）|-|-|
|userStoreKey|String|用户信息存储key|-|-|

### DSN

|名称|类型|描述|可选值|
|-|-|-|-|
|host|String|上报接口域名地址|-|
|init|String|应用初始化接口地址|-|
|report|String|信息上报接口地址|-|

### APPInfo

|名称|类型|描述|可选值|
|-|-|-|-|
|name|String|应用名称|-|
|leader|String|负责人|-|
|desc|String|应用描述|-|

### RequestOption

|名称|类型|描述|可选值|
|-|-|-|-|
|url|String|接口地址|-|
|enableCache|Boolean|开启 cache|false/true|
|enableHttp2|Boolean|开启 http2|false/true|
|enableQuic|Boolean|开启 quic|false/true|
|fail|Function|接口失败回调|-|
|header|Object|请求头（不可设置Referer）|-|
|method|String|请求方法|OPTIONS/GET/HEAD/POST/PUT/DELETE/TRACE/CONNECT|
|responseType|String|响应的数据类型|text/arraybuffer|
|success|Function|接口成功回调|-|
|timeout|Number|超时时间，单位为毫秒|-|

## Usage

### Init

通常在 `app.js` 中完成初始化，可直接挂载到 wx 对象上

```js
import heimdallr from "@heimdallr-sdk/wx";
wx.heimdallrInstance = heimdallr({
    dsn: {
        host: 'http://localhost:8888',
        init: '/project/init',
        report: '/log/report'
    },
    app: {
        name: 'playgroundWx',
        leader: 'test',
        desc: 'test wx proj'
    }
});
```

### Lifecycle

提供两种方式监听页面显示、隐藏方式

#### 1. Overwrite Page
```js
const { heimdallrPage } = wx.heimdallrInstance;
heimdallrPage({
  data: {
    text: "This is page data."
  },
  onLoad: function(options) {
    // Do some initialize when page load.
  },
  onShow: function() {
    // Do something when page show.
  },
  onReady: function() {
    // Do something when page ready.
  },
  onHide: function() {
    // Do something when page hide.
  },
  onUnload: function() {
    // Do something when page close.
  }
});
```
#### 2. Add the track function to the lifecycle function
```js
const { track } = wx.heimdallrInstance;
Page({
  data: {
    text: "This is page data."
  },
  onLoad: function(options) {
    // Do some initialize when page load.
  },
  onShow: function() {
    track('show', this.route);
    // Do something when page show.
  },
  onReady: function() {
    // Do something when page ready.
  },
  onHide: function() {
    track('hide', this.route);
    // Do something when page hide.
  },
  onUnload: function() {
    // Do something when page close.
  }
})
```
