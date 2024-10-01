import {
  BaseOptionsType,
  ClientInfoType,
  CustomerOptionType,
  LinkMsgDataType,
  PageLifeType,
  ReportDataMsgType
} from '@heimdallr-sdk/types';

export interface BrowserReportPayloadDataType extends ClientInfoType {
  [key: string]: any;
}

export interface PromiseErrorDataType {
  msg?: string;
}

export interface PromiseErrorType extends ReportDataMsgType, PromiseErrorDataType {}

export interface LifecycleOptions {
  /**
   * 用户标识（已登录用户）
   */
  userIdentify?: CustomerOptionType;
}

export interface LifecycleDataType extends LinkMsgDataType {
  /** 生命周期类型 */
  lt: PageLifeType;
  /** 真实用户id */
  acc?: string;
}

export interface LifeCycleMsgType extends ReportDataMsgType, LinkMsgDataType {}

export interface ResourceErrorType extends ReportDataMsgType, LinkMsgDataType {
  source: string;
}

export interface CodeErrorOptions {
  /** 错误栈深度 */
  stkLimit?: number;
}

export interface CodeErrorStkType {
  /** 报错行 */
  lin: number;
  /** 报错列 */
  col: number;
  /** 报错函数名 */
  fn: string;
  /** 报错文件名 */
  file: string;
}

export interface CodeErrorDataType {
  /** 报错信息 */
  msg: string;
  /** 报错栈 */
  stk: CodeErrorStkType[]
}

export interface CodeErrorType extends ReportDataMsgType, CodeErrorDataType {}

export interface BrowserOptionsType extends BaseOptionsType, LifecycleOptions, CodeErrorOptions {}
