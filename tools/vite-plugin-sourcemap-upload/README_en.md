# @heimdallr-sdk/vite-plugin-sourcemap-upload

> Vite plug-in, upload sourcemap file

## Options

|Name|Type|Describe|Default|
|-|-|-|-|
|url|String|File upload url|-|
|app_name|String|Application name (must be consistent with the application name when initializing the sdk)|-|
|err_code|String|Interface judgment basis field|code|
|err_msg|String|Interface error information field|msg|

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
