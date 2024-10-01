import {
  BasePluginType,
  EventTypes,
  RouteMsgType,
  ReportDataType,
  RouteTypes,
  RouteDataMsgType,
  BrowserBreadcrumbTypes
} from '@heimdallr-sdk/types';
import { generateUUID } from '@heimdallr-sdk/utils';

function hashPlugin(): BasePluginType {
  return {
    name: 'hashPlugin',
    monitor(notify: (data: RouteDataMsgType) => void) {
      window.addEventListener('hashchange', function (e: HashChangeEvent) {
        console.log('监听到了', e)
        const { oldURL: from, newURL: to } = e;
        if (from === to) {
          return;
        }
        notify({
          from,
          to
        });
      });
    },
    transform(collectedData: RouteDataMsgType): ReportDataType<RouteMsgType> {
      const lid = generateUUID();
      // 添加用户行为栈
      const { from, to } = collectedData;
      this.breadcrumb.unshift({
        lid,
        bt: BrowserBreadcrumbTypes.ROUTE,
        msg: `from "${from}" to "${to}" by hash`,
        t: this.getTime()
      });
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.ROUTE,
        dat: {
          st: RouteTypes.HASH,
          ...collectedData
        }
      };
    }
  };
}

export default hashPlugin;
