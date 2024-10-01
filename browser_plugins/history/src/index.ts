import {
  BasePluginType,
  EventTypes,
  RouteMsgType,
  ReportDataType,
  RouteTypes,
  voidFun,
  BrowserBreadcrumbTypes,
  RouteDataMsgType,
} from '@heimdallr-sdk/types';
import { generateUUID, replaceOld } from '@heimdallr-sdk/utils';
import { supportsHistory } from './libs';

function historyPlugin(): BasePluginType {
  return {
    name: 'historyPlugin',
    monitor(notify: (data: RouteDataMsgType) => void) {
      let lastHref = '';
      if (!supportsHistory()) return;
      const originOnpopstate = window.onpopstate;
      window.onpopstate = function (this: WindowEventHandlers, ...args: any[]) {
        const to = document.location.href;
        const from = lastHref;
        lastHref = to;
        notify({
          from,
          to
        });
        originOnpopstate && originOnpopstate.apply(this, args);
      };
      function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
        return function (this: History, ...args: any[]): void {
          const url = args.length > 2 ? args[2] : undefined;
          if (url) {
            const from = lastHref;
            const to = String(url);
            lastHref = to;
            notify({
              from,
              to
            });
          }
          return originalHistoryFn.apply(this, args);
        };
      }
      // 人为调用，不触发onpopstate
      replaceOld(window.history, 'pushState', historyReplaceFn);
      replaceOld(window.history, 'replaceState', historyReplaceFn);
    },
    transform(collectedData: RouteDataMsgType): ReportDataType<RouteMsgType> {
      const lid = generateUUID();
      // 添加用户行为栈
      const { from, to } = collectedData;
      if (from === to) {
        return;
      }
      this.breadcrumb.unshift({
        lid,
        bt: BrowserBreadcrumbTypes.ROUTE,
        msg: `from "${from}" to "${to}" by history`,
        t: this.getTime()
      });
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.ROUTE,
        dat: {
          st: RouteTypes.HISTORY,
          ...collectedData
        }
      };
    }
  };
}

export default historyPlugin;
