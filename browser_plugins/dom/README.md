# @heimdallr-sdk/dom

[English](./README_en.md)

> 捕获 dom 元素点击事件并上报

## Options

|配置名称|类型|是否必填|描述|默认值|
|-|-|-|-|-|
|throttleDelayTime|Number|否|节流阈值（ms）|300|

## Usage

### cdn

```html
<script src="[dom-dist]/dom.iife.js"></script>
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
            HEIMDALLR_DOM({
                throttleDelayTime: 300 // 非必填
            }),
        ],
        debug: true
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import domPlugin from "@heimdallr-sdk/dom";
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
        domPlugin(),
    ]
});
```

## 上报数据

### 日志上报

|字段名称|描述|
|-|-|
|ele|操作节点|
|x|触发事件的位置相对于整个 document 的 X 坐标值|
|y|触发事件的位置相对于整个 document 的 Y 坐标值|
