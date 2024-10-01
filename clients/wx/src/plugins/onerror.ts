import { generateUUID, replaceOld } from '@heimdallr-sdk/utils';
import {
  BasePluginType,
  EventTypes,
  ConsoleTypes,
  ReportDataType,
  voidFun,
  WxBreadcrumbTypes,
  BreadcrumbLevel
} from '@heimdallr-sdk/types';
import { WxErrorDataType, WxErrorMsgType, WxErrorTypes } from '../types';

function errorPlugin(): BasePluginType {
  return {
    name: 'errorPlugin',
    monitor(notify: (data: WxErrorDataType) => void) {
      const oriApp = App;
      App = function (appOptions: any) {
        replaceOld(
          appOptions,
          'onError',
          function (originMethod: voidFun) {
            return function (...args): void {
              if (originMethod) {
                originMethod.apply(this, args);
              }
              const [error] = args;
              console.log(error, ConsoleTypes.ERROR);
              notify({ err: error });
            };
          },
          true
        );
        return oriApp(appOptions);
      };
    },
    transform(collectedData: WxErrorDataType): ReportDataType<WxErrorMsgType> {
      const { err } = collectedData;
      const lid = generateUUID();
      this.breadcrumb.unshift({
        lid,
        bt: WxBreadcrumbTypes.ERROR,
        l: BreadcrumbLevel.ERROR,
        msg: err,
        t: this.getTime()
      });
      const breadcrumb = this.breadcrumb.getStack();
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.ERROR,
        b: breadcrumb,
        dat: {
          st: WxErrorTypes.UNCAUGHTEXCEPTION,
          err
        }
      };
    }
  };
}

export default errorPlugin;
