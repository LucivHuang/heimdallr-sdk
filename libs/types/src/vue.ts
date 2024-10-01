import { ReportDataMsgType } from './base';
import { IAnyObject } from './common';

export interface VueInstance {
  [key: string]: any;
  config?: VueConfiguration;
  version: string;
}

export interface ViewModel {
  [key: string]: any;
  $root?: Record<string, unknown>;
  $options?: {
    [key: string]: any;
    name?: string;
    props?: IAnyObject;
  };
  $props?: Record<string, unknown>;
}

export interface VueConfiguration {
  errorHandler?(err: Error, vm: ViewModel | any, info: string): void;
  warnHandler?(msg: string, vm: ViewModel | any, trace: string): void;
  [key: string]: any;
}

export interface VueReportDataType extends ReportDataMsgType {
  name: string;
  /** 报错信息 */
  msg: string;
  /** 报错hook */
  hook: string;
  /** 错误栈 */
  stk: string;
  /** 报错行 */
  lin?: number;
  /** 报错列 */
  col?: number;
  /** 报错文件名 */
  fn?: string;
}
