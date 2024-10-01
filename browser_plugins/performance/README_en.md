# @heimdallr-sdk/performance

> Browser performance monitoring sdk

The following indicators can be monitored

- basic
    - dnsSearch: DNS resolution takes time
    - tcpConnect: TCP connection time
    - sslConnect: SSL secure connection takes time
    - request: TTFB network request takes time
    - response: Data transmission time
    - parseDomTree: DOM parsing time
    - resource: Resource loading time
    - domReady: DOM Ready
    - httpHead: Http header size
    - interactive: First interactive time
    - complete: Page fully loaded
    - redirect: Redirects
    - redirectTime: Redirection time
    - duration
    - fp: Render the first pixel, blank screen time
    - fcp: Render the first content, the end time of the first screen
- fmp
    - fmp: Rendering time of meaningful content
- fps
    - fps: Refresh rate
- vitals
    - lcp: Maximum content rendering time
    - fid: Interactive performance
    - cls: Visual stability
- resource
    - resource: Page resource loading time

## Options

|Name|Type|Describe|Optional|Default|
|-|-|-|-|-|
|performancOff|Array|Turn off individual performance functions|basic/fmp/fps/vitals/resource|[]|

## Usage

### cdn

```html
<script src="[performance-dist]/performance.iife.js"></script>
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
            HEIMDALLR_PERFORMANCE(),
        ]
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

```js
import heimdallr from "@heimdallr-sdk/browser";
import performancePlugin from "@heimdallr-sdk/performance";
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
        performancePlugin(),
    ]
});
```
