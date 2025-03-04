import { Core } from '@heimdallr-sdk/core';
import { IAnyObject, PageLifeType, EventTypes, voidFun, WxBreadcrumbTypes, PlatformTypes, TAG } from '@heimdallr-sdk/types';
import { generateUUID, replaceOld } from '@heimdallr-sdk/utils';
import { Breadcrumb } from '@heimdallr-sdk/core';
import { WxContextType, WxOptionsType, WxSettingType, WxTrackTypes } from './types';
import { getStorageSync } from './libs';
import errorPlugin from './plugins/onerror';

const EVENT_LOG_STORE_KEY = 'heimdallr-event-log';

export class WxClient extends Core<WxOptionsType> {
  private wxContext: WxContextType;
  private wxSettings: WxSettingType;
  private diff: number;
  private requestTasks: Map<WechatMiniprogram.RequestTask, IAnyObject>;
  public readonly breadcrumb: Breadcrumb<WxOptionsType>;
  constructor(options: WxOptionsType) {
    super(options);
    this.diff = 0;
    this.wxContext = {};
    this.requestTasks = new Map();
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
      ...app,
      ctime
    };
    const res = await this.report(initUrl, params);
    const { header, data: { data = {} } = {} } = res as any;
    this.setDiff(header['Date']);
    const { id = '' } = data || {};
    return id;
  }

  async getWxSettings() {
    const { bluetoothEnabled: btEn, locationEnabled: locEn } = wx.getSystemSetting();
    const { brand, model, system } = wx.getDeviceInfo();
    const { windowWidth: width, windowHeight: height } = wx.getWindowInfo();
    const { SDKVersion: sdk, language: lan, version } = wx.getAppBaseInfo();
    const {
      cameraAuthorized: camAuth,
      locationAuthorized: locAuth,
      microphoneAuthorized: micAuth,
      notificationAuthorized: notifyAuth,
      phoneCalendarAuthorized: calAuth
    } = wx.getAppAuthorizeSetting();
    const ua = await wx.getRendererUserAgent();
    this.wxSettings = {
      btEn,
      locEn,
      brand,
      model,
      system,
      width,
      height,
      sdk,
      lan,
      version,
      ua,
      camAuth,
      locAuth,
      micAuth,
      notifyAuth,
      calAuth
    };
  }

  isRightEnv() {
    return typeof wx !== 'undefined' && typeof App !== 'undefined';
  }

  report(url: string, data: IAnyObject): Promise<WechatMiniprogram.GeneralCallbackResult> {
    const { reqOption = {} } = this.getClientOptions();
    return new Promise((rs, rj) => {
      const task = wx.request({
        success: (result) => {
          rs(result);
        },
        fail: (res) => rj(res),
        url,
        method: 'POST',
        ...reqOption,
        data,
        dataType: 'json',
        complete: () => {
          this.requestTasks.delete(task);
        }
      });
      this.requestTasks.set(task, data);
    });
  }

  transform(data: IAnyObject): IAnyObject {
    if (!data) {
      return null;
    }
    const {
      dat: { st }
    } = data;
    const preDatas = this.getWxContext();
    let reportData = {
      t: this.getTime(),
      p: PlatformTypes.WECHAT,
      ...preDatas,
      ...data
    };
    if (st === PageLifeType.LOAD) {
      reportData = {
        ...reportData,
        ...this.wxSettings
      };
    }
    return reportData;
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

  handleOnShow(route: string) {
    const last = wx.getStorageSync(EVENT_LOG_STORE_KEY);
    if (last) {
      last.forEach((task: IAnyObject) => {
        this.lifecycleReport(task);
      });
    }
    const { userStoreKey } = this.getClientOptions();
    const sessionId = generateUUID();
    const userInfo = getStorageSync(userStoreKey);
    this.setWxContext({ sid: sessionId, ui: userInfo, url: route });
    const lid = generateUUID();
    const datas = this.transform({
      lid,
      e: EventTypes.LIFECYCLE,
      dat: {
        st: PageLifeType.LOAD,
        href: route
      }
    });
    this.breadcrumb.unshift({
      lid,
      bt: WxBreadcrumbTypes.LIFECYCLE,
      msg: `Enter "${route}"`,
      t: this.getTime()
    });
    this.lifecycleReport(datas);
  }

  handleOnHide(route: string) {
    if (this.requestTasks.size) {
      this.requestTasks.forEach((_, req) => {
        req.abort();
      });
      wx.setStorage({ key: EVENT_LOG_STORE_KEY, data: this.requestTasks });
    }
    const lid = generateUUID();
    const datas = this.transform({
      lid,
      e: EventTypes.LIFECYCLE,
      dat: {
        st: PageLifeType.UNLOAD,
        href: route
      }
    });
    this.breadcrumb.unshift({
      lid,
      bt: WxBreadcrumbTypes.LIFECYCLE,
      msg: `Leave "${route}"`,
      t: this.getTime()
    });
    this.lifecycleReport(datas);
    this.clearWxContext();
  }

  cusOnShow() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client = this;
    return (original: (query: Record<string, string>) => void | Promise<void>): ((e: any) => void) => {
      return function (e) {
        if (original) {
          original.apply(this, e);
        }
        client.handleOnShow(this.route);
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
        client.handleOnHide(this.route);
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
      switch (type) {
        case 'show':
          // 页面显示
          client.handleOnShow(path);
          break;
        case 'hide':
          // 页面隐藏
          client.handleOnHide(path);
          break;

        default:
          console.warn(TAG, 'Unknown type');
          break;
      }
    }
  };
};

export default init;
