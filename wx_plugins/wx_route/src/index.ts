import { BasePluginType, EventTypes, ReportDataType, WxBreadcrumbTypes, BreadcrumbLevel } from '@heimdallr-sdk/types';
import { generateUUID } from '@heimdallr-sdk/utils';
import { WxRouteDataType, WxRouteEvents, WxRouteMsgType } from './types';
import { getCurrentRoute, getNavigateBackTargetUrl } from './libs';

function wxRoutePlugin(): BasePluginType {
  return {
    name: 'wxRoutePlugin',
    monitor(notify: (data: WxRouteDataType) => void) {
      [
        WxRouteEvents.SWITCH_TAB,
        WxRouteEvents.RELAUNCH,
        WxRouteEvents.REDIRECT_TO,
        WxRouteEvents.NAVIGATE_TO,
        WxRouteEvents.NAVIGATE_BACK,
        WxRouteEvents.NAVIGATE_TO_MINI_PROGRAM
      ].forEach((method) => {
        const originMethod = wx[method] as Function;
        Object.defineProperty(wx, method, {
          writable: true,
          enumerable: true,
          configurable: true,
          value: function (
            options:
              | WechatMiniprogram.SwitchTabOption
              | WechatMiniprogram.ReLaunchOption
              | WechatMiniprogram.RedirectToOption
              | WechatMiniprogram.NavigateToOption
              | WechatMiniprogram.NavigateBackOption
              | WechatMiniprogram.NavigateToMiniProgramOption
          ) {
            let toUrl = '';
            if (method === WxRouteEvents.NAVIGATE_BACK) {
              toUrl = getNavigateBackTargetUrl((options as WechatMiniprogram.NavigateBackOption)?.delta);
            } else {
              toUrl = (options as WechatMiniprogram.SwitchTabOption).url;
            }
            const data = {
              from: getCurrentRoute(),
              to: toUrl,
              wt: method
            };
            notify(data);
            if (typeof options.complete === 'function' || typeof options.success === 'function' || typeof options.fail === 'function') {
              const oriFail = options.fail;
              const failHandler:
                | WechatMiniprogram.SwitchTabFailCallback
                | WechatMiniprogram.ReLaunchFailCallback
                | WechatMiniprogram.RedirectToFailCallback
                | WechatMiniprogram.NavigateToFailCallback
                | WechatMiniprogram.NavigateBackFailCallback = function (res) {
                notify({
                  ...data,
                  fail: true,
                  msg: res.errMsg
                });
                if (typeof oriFail === 'function') {
                  return oriFail(res);
                }
              };
              options.fail = failHandler;
            }
            return originMethod.call(this, options);
          }
        });
      });
    },
    transform(collectedData: WxRouteDataType): ReportDataType<WxRouteMsgType> {
      const lid = generateUUID();
      const { to, from, wt, msg: errMsg } = collectedData;
      this.breadcrumb.unshift({
        lid,
        bt: WxBreadcrumbTypes.ROUTE,
        l: errMsg ? BreadcrumbLevel.WARN : BreadcrumbLevel.INFO,
        msg: `from "${from}" to "${to}" by "${wt}"`,
        t: this.getTime()
      });
      const { wt: st } = collectedData;
      delete collectedData.wt;
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.ROUTE,
        dat: {
          st,
          ...collectedData
        }
      };
    }
  };
}

export default wxRoutePlugin;
