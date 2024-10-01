# @heimdallr-sdk/customer

[English](./README_en.md)

> 捕获用户信息、业务信息

自动捕获本地存储的用户信息并上报

在 window 上挂载了 `HEIMDALLR_REPORT` 方法，用于上报业务信息

## HEIMDALLR_REPORT

```js
/**
 * @params {string} customerType - 自定义类型
 * @params {any} data - 上报数据
*/
window.HEIMDALLR_REPORT(customerType, data);
```

## Auto Report

### Options

|配置名称|类型|描述|
|-|-|-|
|customer|Array|客户端上报数据（页面加载完成时收集）|

### customer

|上报字段名称|类型|描述|可选值|
|-|-|-|-|
|name|string|业务字段名称（支持点运算符读取，cookie除外）|-|
|position|string|存储位置|local/session/cookie/global|

## Usage

### cdn

```html
<script src="[customer-dist]/customer.iife.js"></script>
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
            HEIMDALLR_CUSTOMER({
                customers: [{
                    name:'state.userid',
                    position:'local'
                }]
            }),
        ],
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import customerPlugin from "@heimdallr-sdk/customer";
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
        customerPlugin({
            customers: [{
                name:'userid',
                position:'local'
            }]
        }),
    ],
});
```
