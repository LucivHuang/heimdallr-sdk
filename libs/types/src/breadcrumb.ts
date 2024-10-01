import { BrowserBreadcrumbTypes, WxBreadcrumbTypes } from './constant';

export enum BreadcrumbLevel {
  FATAL = 1,
  ERROR,
  WARN,
  INFO,
  DEBUG
}

export type BreadcrumbTypes = WxBreadcrumbTypes | BrowserBreadcrumbTypes | string;

export interface BreadcrumbPushData {
  /** 日志id */
  lid: string;
  /** 类型 */
  bt: BreadcrumbTypes;
  /** 消息 */
  msg: string;
  /** 时间戳 */
  t: number;
  /** level */
  l?: BreadcrumbLevel;
}
