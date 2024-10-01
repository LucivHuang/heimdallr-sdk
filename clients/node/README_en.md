# @heimdallr-sdk/node

> NodeJs monitoring base with built-in error capture sdk

Captureable error types:

- uncaughtException

By default, get method is used for reporting, and custom request function is allowed

## Options

|Name|Type|Describe|Optional|Default|
|-|-|-|-|-|
|dsn|Object|Report interface configuration information|DSN|-|
|app|Object|Application information|APPInfo|-|
|enabled|Boolean|Whether to send a request to the server|true/false|true|
|plugins|Array|Plug-in collection|-|-|
|debug|Boolean|Whether the console displays sdk output information|true/false|false|
|sendFunc|Function|Request function|-|-|

### DSN

|Name|Type|Describe|Optional|
|-|-|-|-|
|host|String|Report interface domain name and address|-|
|init|String|Application initialization interface address|-|
|upload|String|Log reporting interface address|-|

### APPInfo

|Name|Type|Describe|Optional|
|-|-|-|-|
|name|String|Application name|-|
|leader|String|person in charge|-|
|desc|String|Application description|-|

### sendFunc

|Name|Type|Describe|
|url|string|Request url|
|params|Object|Request parameters|

<font color=red>A Promise instance will be returned</font>

for example:

```js
const heimdallerOptions = {
    dsn: {
            host: 'http://localhost:8888',
            init: '/project/init',
            upload: '/log/upload'
        },
        app: {
            name: 'playgroundAPP',
            leader: 'test',
            desc: 'test proj'
        },
        sendFunc: (url, params) => {
            return new Promise((rs, rj) => {
                // do something
                rs({
                    code: 0,
                    msg: 'success',
                    data: 'hello world'
                });
            })
        }
}
```

## Usage

```js
import heimdallr from "@heimdallr-sdk/node";
heimdallr({
    dsn: {
        host: 'http://localhost:8888',
        init: '/project/init',
        upload: '/log/upload'
    },
    app: {
        name: 'playgroundAPP',
        leader: 'test',
        desc: 'test proj'
    }
});
```
