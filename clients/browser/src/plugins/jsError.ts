import { parseStackFrames } from '../libs/parseErrorStk';
import {
  BasePluginType,
  EventTypes,
  ReportDataType,
  BrowserBreadcrumbTypes,
  BreadcrumbLevel,
  IAnyObject,
  StoreType,
  TAG
} from '@heimdallr-sdk/types';
import { generateUUID, getStore, setStore } from '@heimdallr-sdk/utils';
import { BrowserErrorTypes, CodeErrorOptions, CodeErrorType, ResourceErrorType } from '../types';

const ERROR_CACHE = 'HEIMDALLR_SDK_ERROR_CACHE';

interface CollectedType {
  category: EventTypes;
  data: ErrorEvent;
}

interface ResourceTarget {
  src?: string;
  href?: string;
  localName?: string;
}

const getErrorUid = (input: IAnyObject) => window.btoa(encodeURIComponent(JSON.stringify(input)));

const errorPlugin = (options: CodeErrorOptions): BasePluginType => {
  const { stkLimit = 3 } = options;
  return {
    name: 'jsErrorPlugin',
    monitor(notify: (data: CollectedType) => void) {
      window.addEventListener(
        'error',
        (e: ErrorEvent) => {
          e.preventDefault();
          console.error(TAG, e);
          notify({
            category: EventTypes.ERROR,
            data: e
          });
        },
        true
      );
    },
    transform(collectedData: CollectedType): ReportDataType<ResourceErrorType | CodeErrorType> {
      const { category, data } = collectedData;
      const { localName, src, href } = (data.target as ResourceTarget) || {};
      const lid = generateUUID();
      let errorCaches = getStore<Array<string>>(StoreType.SESSION, ERROR_CACHE);
      if (!Array.isArray(errorCaches)) {
        errorCaches = [];
      }
      if (localName) {
        // 资源加载错误
        const resourceData = {
          source: localName,
          href: src || href
        };
        // 上报用户行为栈
        this.breadcrumb.unshift({
          lid,
          bt: BrowserBreadcrumbTypes.RESOURCE,
          l: BreadcrumbLevel.FATAL,
          msg: `Unable to load "${resourceData.href}"`,
          t: this.getTime()
        });
        const errorUid = getErrorUid(resourceData);
        if (errorCaches.includes(errorUid)) {
          return null;
        }
        errorCaches.push(errorUid);
        setStore(StoreType.SESSION, ERROR_CACHE, errorCaches);
        return {
          lid,
          t: this.getTime(),
          e: category,
          dat: {
            st: BrowserErrorTypes.RESOURCEERROR,
            ...resourceData
          }
        };
      }
      // 代码错误
      const { message: msg, error } = data;
      // 上报用户行为栈
      this.breadcrumb.unshift({
        lid,
        bt: BrowserBreadcrumbTypes.CODE_ERROR,
        l: BreadcrumbLevel.ERROR,
        msg,
        t: this.getTime()
      });
      const frames = parseStackFrames(error, stkLimit);
      const stk = frames.map(({ lineno: lin, colno: col, filename: file, functionName: fn }) => ({ lin, col, file, fn }));
      const [topStk] = stk;
      const errorUid = getErrorUid({
        msg,
        ...topStk
      });
      if (errorCaches.includes(errorUid)) {
        return null;
      }
      errorCaches.push(errorUid);
      setStore(StoreType.SESSION, ERROR_CACHE, errorCaches);
      return {
        lid,
        t: this.getTime(),
        e: category,
        dat: {
          st: BrowserErrorTypes.CODEERROR,
          msg,
          stk
        }
      };
    }
  };
};

export default errorPlugin;
