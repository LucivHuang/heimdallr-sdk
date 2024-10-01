import { BreadcrumbPushData } from './breadcrumb';
import { BrowserSubTypes, EventTypes, PlatformTypes } from './constant';

export interface AppInfoType {
  name: string;
  leader: string;
  desc?: string;
}

export interface Dsn {
  /**
   * 上报的域名地址
   */
  host: string;
  /**
   * 应用初始化接口地址
   */
  init: string;
  /**
   * 信息上报接口地址
   */
  report: string;
}

export interface ReportDataType<T> {
  /** 日志id */
  lid: string;
  /** 时间戳 */
  t: number;
  /** 上报类型 */
  e: EventTypes;
  /** 上报详细数据 */
  dat: T;
  /** 面包屑 */
  b?: BreadcrumbPushData[];
}

export interface ReportDataMsgType {
  /** 子类型 */
  st: BrowserSubTypes | number | string;
}

export interface ClientInfoType {
  /** 端 */
  p?: PlatformTypes;
  /** 应用id */
  aid?: string;
  /** 会话id */
  sid?: string;
  /** 独立用户id */
  uid?: string;
  /** 页面标题 */
  ttl?: string;
  /** 当前页面完整url */
  url?: string;
  /** 语言 */
  lan?: string;
  /** 窗口分辨率 */
  ws?: string;
  /** 文档分辨率 */
  ds?: string;
  /** userAgent */
  ua?: string;
}
