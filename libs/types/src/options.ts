import { AppInfoType, Dsn } from './base';
import { StoreTypes } from './constant';
import { BasePluginType } from './plugin';

export interface BaseOptionsType {
  /**
   * 上报接口配置信息
   */
  dsn: Dsn;
  /**
   * 应用信息
   */
  app: AppInfoType;
  /**
   * 为 true 则允许在控制台输出 console
   */
  debug?: boolean;
  /**
   * 指定此 SDK 是否应激活并向后台发送事件
   */
  enabled?: boolean;
  /**
   * 插件
   */
  plugins?: BasePluginType[];
  /**
   * 面包屑最大层级
   */
  maxBreadcrumbs?: number;
}

export interface CustomerOptionType {
  name?: string;
  position?: StoreTypes;
}

export interface RequestPluginOptionType {
  /**
   * 过滤请求url
   */
  ignoreUrls?: string[];
  /**
   * 是否上报接口返回值
   */
  reportResponds?: Boolean;
}
