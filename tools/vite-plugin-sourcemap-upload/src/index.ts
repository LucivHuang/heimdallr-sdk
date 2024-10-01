import path from 'path';
import fs from 'fs';
import request from 'request';
import { SourcemapOptionType, ResponseType } from '@heimdallr-sdk/types';

const TAG = '[vite-plugin-sourcemap-upload]: ';

export default function vitePluginSourcemapUpload(pluginOptions: SourcemapOptionType) {
  let sourcemapFiles = [];
  let outDir = '';

  const upload = (filePath: string): Promise<ResponseType> =>
    new Promise((resolve, rejected) => {
      const { url, app_name, err_code = 'code', err_msg = 'msg' } = pluginOptions;
      if (!url || !app_name) {
        rejected({ code: -1, msg: 'missing url or app_name in options' });
      }

      const fileStream = fs.createReadStream(filePath);
      const filename = path.basename(filePath);
      const config = {
        method: 'POST',
        url,
        formData: {
          file: {
            value: fileStream,
            options: {
              filename: filePath,
              contentType: null
            }
          },
          dirname: app_name,
          filename
        }
      };

      request(config, function (err, res) {
        if (err) {
          rejected({
            code: -1,
            msg: err.message || err
          });
          return;
        }
        try {
          const data = JSON.parse(res.body || '{}');
          const code = data[err_code];
          const result = {
            code: code || code === 0 ? code : -1,
            msg: data[err_msg] || '未知错误'
          };
          if (result.code === 0) {
            resolve(result);
            return;
          }
          rejected(result);
        } catch (error) {
          rejected({
            code: -1,
            msg: error.message || error
          });
        }
      });
    });

  return {
    name: 'sourcemap-upload',

    writeBundle(options: any, bundle: any) {
      const { dir } = options;
      outDir = dir;
      const fileNames = Object.keys(bundle);
      sourcemapFiles = fileNames.filter((fileName) => fileName.endsWith('.js.map'));
      return;
    },
    async closeBundle() {
      for (const file of sourcemapFiles) {
        try {
          const { code, msg } = await upload(`${outDir}/${file}`);
          if (code !== 0) {
            console.error(TAG, msg);
          }
        } catch (error) {
          console.error(TAG, error);
        }
      }
      console.log(TAG, 'upload finished');
      return;
    }
  };
}
