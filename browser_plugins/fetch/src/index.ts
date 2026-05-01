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
  RequestPluginOptionType
} from '@heimdallr-sdk/types';
import { generateUUID, getUrlPath, replaceOld } from '@heimdallr-sdk/utils';

function fetchPlugin(options: RequestPluginOptionType = {}): BasePluginType {
  const { ignoreUrls = [], reportResponds = false } = options;
  return {
    name: 'fetchPlugin',
    monitor(notify: (data: HttpCollectDataType) => void) {
      const { initUrl, uploadUrl } = this.getContext();
      const getTime = this.getTime.bind(this);
      const ignore = [...ignoreUrls, uploadUrl, initUrl].map((item) => getUrlPath(item));
      replaceOld(window, 'fetch', (originalFetch: typeof window.fetch) => {
        return function (url: RequestInfo, config: RequestInit = {}): Promise<Response> {
          const requestUrl = typeof url === 'string' ? url : url.url;
          const sTime = getTime();
          const m = (config && (config.method as MethodTypes)) || MethodTypes.GET;
          const httpCollect: HttpCollectDataType = {
            req: {
              url: requestUrl,
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
          const isBlock = ignore.includes(getUrlPath(requestUrl));
          return originalFetch.call(window, url, config).then(
            (res: Response) => {
              const resClone = res.clone();
              const eTime = getTime();
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
              if (!isBlock) {
                const eTime = getTime();
                httpCollect.et = eTime - sTime;
                httpCollect.res.sta = 0;
                notify(httpCollect);
              }
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
