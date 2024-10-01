import { Core } from '@heimdallr-sdk/core';
import { IAnyObject, PageLifeType, EventTypes, voidFun, WxBreadcrumbTypes, PlatformTypes } from '@heimdallr-sdk/types';
import { generateUUID, replaceOld } from '@heimdallr-sdk/utils';
import { Breadcrumb } from '@heimdallr-sdk/core';
import { WxContextType, WxOptionsType, WxSettingType, WxTrackTypes } from './types';
import { getStorageSync } from './libs';
import errorPlugin from './plugins/onerror';

export class WxClient extends Core<WxOptionsType> {
  private wxContext: WxContextType;
  private wxSettings: WxSettingType;
  private diff: number;
  public readonly breadcrumb: Breadcrumb<WxOptionsType>;
  constructor(options: WxOptionsType) {
    super(options);
    this.diff = 0;
    this.wxContext = {};
    this.breadcrumb = new Breadcrumb(options);
  }

  setWxContext(context: WxContextType) {
    this.wxContext = { ...this.wxContext, ...context };
  }

  clearWxContext() {
    this.wxContext = {};
  }

  getWxContext(): WxContextType {
    return { ...this.wxContext };
  }

  async initAPP() {
    await this.getWxSettings();
    const { initUrl, app } = this.getContext();
    const ctime = this.getTime();
    const params = {
      id: generateUUID(),
      ...app,
      ctime
    };
    const res = await this.report(initUrl, params);
    const { header, data: { data = {} } = {} } = res as any;
    this.setDiff(header['Date']);
    const { id = '' } = data || {};
    return id;
  }

  getWxSettings() {
    return Promise.all([(wx as any).getRendererUserAgent(), wx.getSystemInfo()]).then(([userAgent, info]) => {
      this.wxSettings = {
        ua: userAgent,
        lan: info.language
      };
    });
  }

  isRightEnv() {
    return typeof wx !== 'undefined' && typeof App !== 'undefined';
  }

  report(url: string, data: IAnyObject): Promise<WechatMiniprogram.GeneralCallbackResult> {
    const { reqOption = {} } = this.getClientOptions();
    return new Promise((rs, rj) => {
      wx.request({
        success: (result) => {
          rs(result);
        },
        fail: (res) => rj(res),
        url,
        method: 'POST',
        ...reqOption,
        data,
        dataType: 'json'
      });
    });
  }

  transform(datas: IAnyObject): IAnyObject {
    if (!datas) {
      return null;
    }
    const preDatas = this.getWxContext();
    return {
      t: this.getTime(),
      p: PlatformTypes.WECHAT,
      ...preDatas,
      ...this.wxSettings,
      ...datas
    };
  }

  nextTick(cb: Function, ctx: Object, ...args: any[]) {
    wx.nextTick(() => {
      cb.call(ctx, ...args);
    });
  }

  setDiff(date: string) {
    const serverDate = new Date(date);
    const inDiff = Date.now() - serverDate.getTime();
    if (!this.diff || this.diff > inDiff) {
      this.diff = inDiff;
    }
  }

  getTime() {
    return Date.now() - (this.diff || 0);
  }

  // lifecycle

  lifecycleReport(datas: IAnyObject) {
    const { uploadUrl, enabled } = this.getContext();
    if (!datas) {
      return;
    }
    if (!enabled) {
      return;
    }
    if (!this.appID) {
      this.taskQueue.push(datas);
      return;
    }
    this.nextTick(this.report, this, uploadUrl, { app_id: this.appID, ...datas });
  }

  cusOnShow() {
    const { userStoreKey } = this.getClientOptions();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client = this;
    return (original: (query: Record<string, string>) => void | Promise<void>): ((e: any) => void) => {
      return function (e) {
        if (original) {
          original.apply(this, e);
        }
        const sessionId = generateUUID();
        const userInfo = getStorageSync(userStoreKey);
        client.setWxContext({ sid: sessionId, ui: userInfo, url: this.route });
        const lid = generateUUID();
        const datas = client.transform({
          lid,
          e: EventTypes.LIFECYCLE,
          dat: {
            st: PageLifeType.LOAD,
            href: this.route
          }
        });
        client.breadcrumb.unshift({
          lid,
          bt: WxBreadcrumbTypes.LIFECYCLE,
          msg: `Enter "${this.route}"`,
          t: client.getTime()
        });
        client.lifecycleReport.call(client, datas);
      };
    };
  }
  cusOnHide() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client = this;
    return (original: () => void | Promise<void>): voidFun => {
      return function () {
        if (original) {
          original.apply(this);
        }
        const lid = generateUUID();
        const datas = client.transform({
          lid,
          e: EventTypes.LIFECYCLE,
          dat: {
            st: PageLifeType.UNLOAD,
            href: this.route
          }
        });
        client.breadcrumb.unshift({
          lid,
          bt: WxBreadcrumbTypes.LIFECYCLE,
          msg: `Leave "${this.route}"`,
          t: client.getTime()
        });
        client.lifecycleReport.call(client, datas);
        client.clearWxContext();
      };
    };
  }
}

const init = (options: WxOptionsType) => {
  const client = new WxClient(options);
  const { plugins = [] } = options;
  client.use([errorPlugin(), ...plugins]);
  return {
    // 代替 Page 函数
    heimdallrPage: (
      pageOptions: WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>
    ) => {
      replaceOld(pageOptions, 'onShow', client.cusOnShow(), true);
      replaceOld(pageOptions, 'onHide', client.cusOnHide(), true);
      Page(pageOptions);
    },
    // 手动在页面 onShow/onHide 添加埋点
    track: (type: WxTrackTypes, path: string) => {
      const { userStoreKey } = client.getClientOptions();
      const lid = generateUUID();
      switch (type) {
        case 'show':
          {
            // 页面显示
            const sessionId = generateUUID();
            const userInfo = getStorageSync(userStoreKey);
            client.setWxContext({ sid: sessionId, ui: userInfo, url: path });
            const datas = client.transform({
              lid,
              e: EventTypes.LIFECYCLE,
              dat: {
                st: PageLifeType.LOAD,
                href: path
              }
            });
            client.breadcrumb.unshift({
              lid,
              bt: WxBreadcrumbTypes.LIFECYCLE,
              msg: `Enter "${path}"`,
              t: client.getTime()
            });
            client.lifecycleReport.call(client, datas);
          }
          break;
        case 'hide':
          {
            // 页面隐藏
            const datas = client.transform({
              lid,
              e: EventTypes.LIFECYCLE,
              dat: {
                st: PageLifeType.UNLOAD,
                href: path
              }
            });
            client.breadcrumb.unshift({
              lid,
              bt: WxBreadcrumbTypes.LIFECYCLE,
              msg: `Leave "${path}"`,
              t: client.getTime()
            });
            client.lifecycleReport.call(client, datas);
            client.clearWxContext();
          }
          break;

        default:
          console.log('Unknown type');
          break;
      }
    }
  };
};

export default init;
