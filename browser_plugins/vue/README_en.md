# @heimdallr-sdk/vue

> Catch errors thrown by the vue framework

## Options

|Name|Type|Describe|
|-|-|-|-|-|
|vue|Object|Vue instance|

## Usage

### cdn

```html
<script src="[vue-dist]/vue.iife.js"></script>
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
            HEIMDALLR_VUE({
                vue: VueInstance
            }),
        ],
    };
</script>
<script async src="/browser-dist/browser.iife.js"></script>
```

### npm

#### Vue2.x

```js
import Vue from "vue";
import heimdallr from "@heimdallr-sdk/browser";
import vuePlugin from "@heimdallr-sdk/vue";
heimdallr({
  dsn: {
    host: "localhost:8888",
    init: "/project/init",
    upload: "/log/upload",
  },
  app: {
    name: "playgroundAPP",
    leader: "test",
    desc: "test proj",
  },
  plugins: [
    vuePlugin({
      vue: Vue,
    }),
  ],
});
```

#### Vue3.x

```js
import heimdallr from "@heimdallr-sdk/browser";
import vuePlugin from "@heimdallr-sdk/vue";
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

heimdallr({
  dsn: {
    host: "localhost:8888",
    init: "/project/init",
    upload: "/log/upload",
  },
  app: {
    name: "playgroundAPP",
    leader: "test",
    desc: "test proj",
  },
  plugins: [
    vuePlugin({
      vue: app,
    }),
  ],
});
```
