# @heimdallr-sdk/vite-plugin-sourcemap-upload

[English](./README_en.md)

> vite 插件，上传 sourcemap 文件

## Options

|名称|类型|描述|默认值|
|-|-|-|-|
|url|String|文件上传接口地址|-|
|app_name|String|应用名称（需与注册sdk时的应用名称一致）|-|
|err_code|String|接口判断依据字段|code|
|err_msg|String|接口错误信息字段|msg|

## Usage

```js
import sourceMapUpload from "@heimdallr-sdk/vite-plugin-sourcemap-upload";

export default defineConfig({
  plugins: [vue(), sourceMapUpload({
    app_name: 'playground',
    url: `http://localhost:8001/sourcemap/upload`
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: true
  }
})
```
