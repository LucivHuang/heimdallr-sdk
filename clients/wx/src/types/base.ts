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

export type AuthType = 'authorized' | 'denied' | 'not determined';

export interface WxSettingType {
  /** 设备相关 */
  /** bluetoothEnabled - 蓝牙的系统开关 */
  btEn: boolean;
  /** locationEnabled - 地理位置的系统开关 */
  locEn: boolean;
  /** 设备品牌 */
  brand: string;
  /** 设备型号 */
  model: string;
  /** 操作系统及版本 */
  system: string;
  /** windowWidth - 可使用窗口宽度，单位px */
  width: number;
  /** windowHeight - 可使用窗口高度，单位px */
  height: number;

  /** 微信相关 */
  /** SDKVersion - 客户端基础库版本 */
  sdk: string;
  /** language - 微信设置的语言 */
  lan: string;
  /** version - 微信版本 */
  version: string;
  /** userAgent 字段 */
  ua: string;
  /** cameraAuthorized - 允许微信使用摄像头的开关 */
  camAuth: AuthType;
  /** locationAuthorized - 允许微信使用定位的开关 */
  locAuth: AuthType;
  /** microphoneAuthorized - 允许微信使用麦克风的开关 */
  micAuth: AuthType;
  /** notificationAuthorized - 允许微信通知的开关 */
  notifyAuth: AuthType;
  /** phoneCalendarAuthorized - 允许微信读写日历的开关 */
  calAuth: AuthType;
}
