# @heimdallr-sdk/webpack-plugin-sourcemap-upload

[English](./README_en.md)

> webpack 插件，上传 sourcemap 文件

## Options

|名称|类型|描述|默认值|
|-|-|-|-|
|url|String|文件上传接口地址|-|
|app_name|String|应用名称（需与注册sdk时的应用名称一致）|-|
|err_code|String|接口判断依据字段|code|
|err_msg|String|接口错误信息字段|msg|

## Usage

```js
import UploadSourceMapPlugin from "@heimdallr-sdk/webpack-plugin-sourcemap-upload";
const config = {
  plugins: [
    new UploadSourceMapPlugin({
      app_name: 'playgroundAPP',
      url: `http://localhost:8888/sourcemap/upload`
    })
  ]
}
```
