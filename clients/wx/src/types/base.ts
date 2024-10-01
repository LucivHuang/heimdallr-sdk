import { BaseOptionsType, IAnyObject } from '@heimdallr-sdk/types';

export interface WxOptionsType extends BaseOptionsType {
  /**
   * wx.request配置项
   */
  reqOption?: WechatMiniprogram.RequestOption;
  /**
   * 用户信息
   */
  userStoreKey: string;
}

export type WxTrackTypes = 'show' | 'hide';

export interface WxContextType {
  sid?: string;
  url?: string;
  ui?: IAnyObject | string;
}

export interface WxSettingType {
  ua: string;
  lan: string;
}
