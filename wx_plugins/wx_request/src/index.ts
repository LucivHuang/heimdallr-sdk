import { WxClient } from '@heimdallr-sdk/wx'
import {
  BasePluginType,
  EventTypes,
  MethodTypes,
  ReportDataType,
  HttpCollectDataType,
  HttpCollectType,
  HttpTypes,
  WxBreadcrumbTypes,
  BreadcrumbLevel,
  RequestPluginOptionType
} from '@heimdallr-sdk/types';
import { generateUUID, getUrlPath } from '@heimdallr-sdk/utils';
import { WxXhrTypes } from './types';

function wxRequestPlugin(options: RequestPluginOptionType = {}): BasePluginType {
  const { ignoreUrls = [], reportResponds = false } = options;
  return {
    name: 'wxRequestPlugin',
    monitor(notify: (data: HttpCollectDataType) => void) {
      const { initUrl, uploadUrl } = this.getContext();
      const client = this as WxClient;
      const ignore = [...ignoreUrls, uploadUrl, initUrl].map((url) => getUrlPath(url));
      [WxXhrTypes.REQUEST, WxXhrTypes.DOWNLOAD_FILE, WxXhrTypes.UPLOAD_FILE].forEach((hook) => {
        const originRequest = wx[hook];
        Object.defineProperty(wx, hook, {
          writable: true,
          enumerable: true,
          configurable: true,
          value: function (...args: any[]) {
            const options: WechatMiniprogram.RequestOption | WechatMiniprogram.DownloadFileOption | WechatMiniprogram.UploadFileOption =
              args[0];
            const { url } = options;
            const isBlock = ignore.includes(getUrlPath(url));
            if (isBlock) {
              return originRequest.call(this, options);
            }
            let method = '';
            if ((options as WechatMiniprogram.RequestOption).method) {
              method = (options as WechatMiniprogram.RequestOption).method;
            } else if (hook === WxXhrTypes.DOWNLOAD_FILE) {
              method = MethodTypes.GET;
            } else {
              method = MethodTypes.POST;
            }
            let reqData = undefined;
            switch (hook) {
              case WxXhrTypes.REQUEST:
                reqData = (options as WechatMiniprogram.RequestOption).data;
                break;
              case WxXhrTypes.DOWNLOAD_FILE:
                reqData = {
                  filePath: (options as WechatMiniprogram.DownloadFileOption).filePath
                };
                break;
              case WxXhrTypes.UPLOAD_FILE:
                reqData = {
                  filePath: (options as WechatMiniprogram.UploadFileOption).filePath,
                  name: (options as WechatMiniprogram.UploadFileOption).name
                };
                break;
              default:
                break;
            }
            const sTime = client.getTime();
            // 收集小程序的请求信息
            const httpCollect: HttpCollectDataType = {
              req: {
                url,
                m: method,
                dat: reqData
              },
              res: {},
              t: sTime
            };
            // 成功回调
            const oriSuccess = options.success;
            const successHandler:
              | WechatMiniprogram.RequestSuccessCallback
              | WechatMiniprogram.DownloadFileSuccessCallback
              | WechatMiniprogram.UploadFileFailCallback = function (res) {
              const eTime = client.getTime();
              if (reportResponds) {
                httpCollect.res.dat = res.data;
              }
              httpCollect.et = eTime - sTime;
              httpCollect.res.sta = res.statusCode;
              httpCollect.res.msg = res.errMsg;
              notify(httpCollect);
              if (typeof oriSuccess === 'function') {
                return oriSuccess(res);
              }
            };
            // 失败回调
            const oriFail = options.fail;
            const failHandler:
              | WechatMiniprogram.RequestFailCallback
              | WechatMiniprogram.DownloadFileFailCallback
              | WechatMiniprogram.UploadFileFailCallback = function (err) {
              const eTime = client.getTime();
              httpCollect.et = eTime - sTime;
              httpCollect.res.msg = err.errMsg;
              httpCollect.res.sta = 0;
              notify(httpCollect);
              if (typeof oriFail === 'function') {
                return oriFail(err);
              }
            };
            const actOptions = {
              ...options,
              success: successHandler,
              fail: failHandler
            };
            return originRequest.call(this, actOptions);
          }
        });
      });
    },
    transform(collectedData: HttpCollectDataType): ReportDataType<HttpCollectType> {
      const lid = generateUUID();
      const {
        req: { m, url, dat: params },
        et,
        res: { sta }
      } = collectedData;
      this.breadcrumb.unshift({
        lid,
        bt: WxBreadcrumbTypes.API,
        l: sta === 0 ? BreadcrumbLevel.WARN : BreadcrumbLevel.INFO,
        message: `${m} "${url}" width "${JSON.stringify(params)}" took ${et} ms`,
        t: this.getTime()
      });
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.API,
        dat: {
          st: HttpTypes.XHR,
          ...collectedData
        }
      };
    }
  };
}

export default wxRequestPlugin;
