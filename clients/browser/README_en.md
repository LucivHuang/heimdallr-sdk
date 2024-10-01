# @heimdallr-sdk/browser

> Browser monitoring base, built-in error capture SDK

Capturable error types:

- JS code error
- Resource Load Error
- unhandledrejection

Report using sendBeacon API (post) by default

## Options

|Name|Type|Describe|Optional|Default|
|-|-|-|-|-|
|dsn|Object|Report Interface Configuration Information|DSN|-|
|app|Object|Application Information|APPInfo|-|
|enabled|Boolean|Whether to send events to the background|true/false|true|
|maxBreadcrumbs|Number|Bread crumb maximum level|-|5|
|stkLimit|Number|error stack depth|-|3|
|userIdentify|Customer|User ID|-|-|
|plugins|Array|Plug-in Collection|-|-|
|debug|Boolean|Does the console display SDK output information|true/false|false|

### DSN

|Name|Type|Describe|Optional|
|-|-|-|-|
|host|String|Report Interface Domain Name Address|-|
|init|String|Application Initialization Interface Address|-|
|report|String|Log reporting interface address|-|

### APPInfo

|Name|Type|Describe|Optional|
|-|-|-|-|
|name|String|Application Name|-|
|leader|String|Person in charge|-|
|desc|String|Application Description|-|

### Customer

|Name|Type|Describe|Optional|
|-|-|-|-|
|name|string|Business field names (supported for point operator reading, except cookies)|-|
|position|string|Storage Location|local/session/cookie/global|

## Usage

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
