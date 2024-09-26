import {
  BasePluginType,
  BreadcrumbLevel,
  BrowserBreadcrumbTypes,
  EventTypes,
  HttpCollectDataType,
  HttpCollectType,
  HttpTypes,
  MethodTypes,
  ReportDataType,
  voidFun,
  RequestPluginOptionType
} from '@heimdallr-sdk/types';
import { generateUUID, getUrlPath, replaceOld } from '@heimdallr-sdk/utils';

function fetchPlugin(options: RequestPluginOptionType = {}): BasePluginType {
  const { ignoreUrls = [], reportResponds = false } = options;
  return {
    name: 'fetchPlugin',
    monitor(notify: (data: HttpCollectDataType) => void) {
      const { initUrl, uploadUrl } = this.context;
      const client = this;
      const ignore = [...ignoreUrls, uploadUrl, initUrl].map((url) => getUrlPath(url));
      replaceOld(window, 'fetch', (originalFetch: voidFun) => {
        return function (url: string, config: Partial<Request> = {}): void {
          const sTime = client.getTime();
          const m = (config && (config.method as MethodTypes)) || MethodTypes.GET;
          const httpCollect: HttpCollectDataType = {
            req: {
              url,
              m,
              dat: config && config.body
            },
            t: sTime,
            res: {}
          };
          const headers = new Headers(config.headers || {});
          Object.assign(headers, {
            setRequestHeader: headers.set
          });
          config = {
            ...config,
            headers
          };
          const isBlock = ignore.includes(getUrlPath(url));
          return originalFetch.apply(window, [url, config]).then(
            (res: Response) => {
              const resClone = res.clone();
              const eTime = client.getTime();
              httpCollect.et = eTime - sTime;
              httpCollect.res.sta = resClone.status;
              resClone.text().then((data) => {
                if (isBlock) return;
                if (reportResponds) {
                  httpCollect.res.dat = data;
                }
                notify(httpCollect);
              });
              return res;
            },
            (err: Error) => {
              if (isBlock) return;
              const eTime = client.getTime();
              httpCollect.et = eTime - sTime;
              httpCollect.res.sta = 0;
              notify(httpCollect);
              throw err;
            }
          );
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
        bt: BrowserBreadcrumbTypes.FETCH,
        l: sta != 200 ? BreadcrumbLevel.WARN : BreadcrumbLevel.INFO,
        msg: `${m} "${url}" width "${JSON.stringify(params)}" took ${et} ms`,
        t: this.getTime()
      });
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.API,
        dat: {
          st: HttpTypes.FETCH,
          ...collectedData
        }
      };
    }
  };
}

export default fetchPlugin;
