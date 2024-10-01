# @heimdallr-sdk/customer

> Capture user information and business information

Automatically capture and report locally stored user information

The `HEIMDALLR_REPORT` method is mounted on the window to report business information

## HEIMDALLR_REPORT

```js
/**
 * @params {string} customerType - Custom type
 * @params {any} data - Report data
*/
window.HEIMDALLR_REPORT(customerType, data);
```

## Auto Report

### Options

|Name|Type|Describe|
|-|-|-|
|customer|Array|Client reports data (collected when the page is loaded)|

### customer

|Name|Type|Describe|Optional|
|-|-|-|-|
|name|string|Business field name (point operator reading is supported, except cookies)|-|
|position|string|Storage location|local/session/cookie/global|

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
