import {
  BasePluginType,
  BreadcrumbLevel,
  BrowserBreadcrumbTypes,
  EventTypes,
  HttpCollectDataType,
  HttpCollectType,
  HttpTypes,
  IAnyObject,
  ReportDataType,
  voidFun,
  RequestPluginOptionType
} from '@heimdallr-sdk/types';
import { generateUUID, getUrlPath, replaceOld } from '@heimdallr-sdk/utils';

interface XMLHttp extends IAnyObject {
  httpCollect: HttpCollectDataType;
}

function XHRPlugin(options: RequestPluginOptionType = {}): BasePluginType {
  const { ignoreUrls = [], reportResponds = false } = options;
  const originalXhrProto = XMLHttpRequest.prototype;
  return {
    name: 'XHRPlugin',
    monitor(notify: (data: HttpCollectDataType) => void) {
      const { initUrl, uploadUrl } = this.getContext();
      const client = this;
      const ignore = [...ignoreUrls, uploadUrl, initUrl].map((url) => getUrlPath(url));
      replaceOld(originalXhrProto, 'open', (originalOpen: voidFun): voidFun => {
        return function (this: XMLHttp, ...args: any[]): void {
          this.httpCollect = {
            req: {
              m: args[0] ? args[0].toUpperCase() : args[0],
              url: args[1]
            },
            res: {},
            t: client.getTime()
          };
          originalOpen.apply(this, args);
        };
      });
      replaceOld(originalXhrProto, 'send', (originalSend: voidFun): voidFun => {
        return function (this: IAnyObject, ...args: any[]): void {
          const { req } = this.httpCollect;
          const { url } = req;
          this.addEventListener('loadend', function (this: XMLHttp) {
            const isBlock = ignore.includes(getUrlPath(url));
            if (isBlock) return;
            const { responseType, response, status } = this;
            req.data = args[0];
            const eTime = client.getTime();
            if (reportResponds && ['', 'json', 'text'].indexOf(responseType) !== -1) {
              this.httpCollect.res.dat = typeof response === 'object' ? JSON.stringify(response) : response;
            }
            this.httpCollect.res.sta = status;
            this.httpCollect.et = eTime - this.httpCollect.t;
            notify(this.httpCollect);
          });
          originalSend.apply(this, args);
        };
      });
    },
    transform(collectedData: HttpCollectDataType): ReportDataType<HttpCollectType> {
      const lid = generateUUID();
      // 添加用户行为栈
      const {
        req: { m, url, dat: params },
        et = 0,
        res: { sta }
      } = collectedData;
      this.breadcrumb.unshift({
        lid,
        bt: BrowserBreadcrumbTypes.XHR,
        l: sta != 200 ? BreadcrumbLevel.WARN : BreadcrumbLevel.INFO,
        msg: `${m} "${url}" width "${JSON.stringify(params)}" took ${et} ms`,
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

export default XHRPlugin;
