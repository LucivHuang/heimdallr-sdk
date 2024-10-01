# @heimdallr-sdk/browser

[English](./README_en.md)

> 浏览器监控基座，内置错误捕获sdk

可捕获错误类型

- js错误
- 资源加载错误
- unhandledrejection

默认使用 sendBeaconAPI （post）上报

## 配置项

|配置名称|类型|描述|可选值|默认值|
|-|-|-|-|-|
|dsn|Object|上报接口配置信息|DSN|-|
|app|Object|应用信息|APPInfo|-|
|enabled|Boolean|是否向后台发送事件|true/false|true|
|maxBreadcrumbs|Number|面包屑最大层级|-|5|
|stkLimit|Number|收集错误栈层级|-|3|
|userIdentify|Customer|用户标识|-|-|
|plugins|Array|插件集合|-|-|
|debug|Boolean|控制台是否显示sdk输出信息|true/false|false|

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

### Customer

|名称|类型|描述|可选值|
|-|-|-|-|
|name|string|业务字段名称（支持点运算符读取，cookie除外）|-|
|position|string|存储位置|local/session/cookie/global|

## 使用方式

### cdn

```html
<script>
    window.__HEIMDALLR_OPTIONS__ = {
        dsn: {
            host: 'localhost:8888',
            init: '/project/init',
            report: '/log/report'
        },
        app: {
            name: 'playgroundAPP',
            leader: 'test',
            desc: 'test proj'
        },
        userIdentify: {
            name: '__state__.a.0.user.id', // window.__state__ = { a: [{ user: { id:'123' } }] }
            position: 'global'
        }
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
heimdallr({
    dsn: {
        host: 'localhost:8888',
        init: '/project/init',
        report: '/log/report'
    },
    app: {
        name: 'playgroundAPP',
        leader: 'test',
        desc: 'test proj'
    },
    userIdentify: {
        name: '__state__.a.0.user.id', // window.__state__ = { a: [{ user: { id:'123' } }] }
        position: 'global'
    }
});
```

## 上报数据

### 应用初始化

|字段名称|描述|
|-|-|
|id|应用id|
|name|应用名称|负责人|
|leader|负责人|
|desc|应用描述|

### 日志上报

|字段名称|描述|特有|
|-|-|-|
|aid|应用id|-|
|sid|会话id|-|
|uid|独立用户id|-|
|p|平台|-|
|ttl|页面标题|页面加载|
|url|页面路径|-|
|lan|语言|页面加载|
|ua|User-agent|页面加载|
|ws|窗口分辨率|页面加载|
|ds|文档分辨率|页面加载|
|lid|日志id|-|
|t|时间戳|-|
|e|日志类型|-|
|b|面包屑|页面卸载|
|dat|日志详情（插件不同有差异，都带有日志子类型）|-|

#### 平台类型

|值|描述|
|-|-|
|1|浏览器|
|2|微信小程序|
|3|Node|

#### 日志类型

|值|描述|
|-|-|
|1|生命周期|
|2|异常|
|3|性能|
|4|请求|
|5|节点操作|
|6|路由|
|7|控制台输出|
|8|录屏|
|9|Vue|
|10|自定义|

#### 日志子类型

以下为提供的内置类型，可自由扩展

|值|描述|
|-|-|
|11|页面加载|
|12|页面卸载|
|21|js 异常|
|22|资源加载异常|
|23|未捕获 reject 异常|
|24|页面崩溃|
|31|FMP|
|32|FPS|
|33|性能基础参数|
|34|VITALS|
|35|资源加载情况|
|41|XMLHttpRequest 请求|
|42|fetch 请求|
|51|页面点击|
|61|hash路由跳转|
|62|history路由跳转|
|111|自定义类型|
