import { BasePluginType, EventTypes, ReportDataType, WxBreadcrumbTypes } from '@heimdallr-sdk/types';
import { generateUUID, replaceOld } from '@heimdallr-sdk/utils';
import { WxDomDataType, WxDomMsgType } from './types';

function wxDomPlugin(): BasePluginType {
  return {
    name: 'wxDomPlugin',
    monitor(notify: (data: WxDomDataType) => void) {
      const originPage = Page;
      Page = function (options) {
        if (options) {
          Object.keys(options).forEach((m) => {
            if ('function' !== typeof options[m]) {
              return;
            }
            replaceOld(
              options,
              m,
              function (originMethod: (args: any) => void) {
                return function (...args: any): void {
                  const e = args[0];
                  // 判断是否是事件
                  if (e && e.type && e.currentTarget) {
                    const { type, detail, currentTarget } = e;
                    notify({
                      m,
                      dt: type,
                      det: detail,
                      ct: currentTarget
                    });
                  }
                  return originMethod.apply(this, args);
                };
              },
              true
            );
          });
        }
        return originPage(options);
      };
    },
    transform(collectedData: WxDomDataType): ReportDataType<WxDomMsgType> {
      const lid = generateUUID();
      this.breadcrumb.unshift({
        lid,
        bt: WxBreadcrumbTypes.CLICK,
        msg: `Invoke "${collectedData.m}"`,
        t: this.getTime()
      });
      const { dt: st } = collectedData;
      delete collectedData.dt;
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.DOM,
        dat: {
          st,
          ...collectedData
        }
      };
    }
  };
}

export default wxDomPlugin;
