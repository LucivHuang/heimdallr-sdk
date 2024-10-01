# @heimdallr-sdk/xhr

[English](./README_en.md)

> 捕获 XMLHttprequest 请求，上报请求头、响应、请求耗时

## Options

|配置名称|类型|是否必填|描述|默认值|
|-|-|-|-|-|
|ignoreUrls|Array|否|过滤请求url|-|
|reportResponds|Boolean|否|是否上报返回值|false|

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

## 上报数据

### 日志上报

|字段名称|描述|
|-|-|
|req|请求信息|
|res|响应信息|
|t|触发事件|
|et|耗时|

### 请求信息

|字段名称|描述|
|-|-|
|m|请求方法|
|url|请求连接|
|dat|请求参数|

### 请求信息

|字段名称|描述|
|-|-|
|sta|响应状态|
|msg|响应信息|
|dat|响应数据|
