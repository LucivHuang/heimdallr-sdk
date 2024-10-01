# @heimdallr-sdk/webpack-plugin-sourcemap-upload

> Webpack plug-in, upload sourcemap file

## Options

|Name|Type|Describe|Default|
|-|-|-|-|
|url|String|File upload url|-|
|app_name|String|Application name (must be consistent with the application name when initializing the sdk)|-|
|err_code|String|Interface judgment basis field|code|
|err_msg|String|Interface error information field|msg|

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
