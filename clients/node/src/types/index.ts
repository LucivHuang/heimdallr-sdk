import { BaseOptionsType, ClientInfoType, IAnyObject, InterfaceResponseType, ReportDataMsgType } from '@heimdallr-sdk/types';

export interface UncaughtExceptionDataType extends ReportDataMsgType {
  msg: string;
  name: string;
  stk?: string;
}

export interface NodeReportPayloadDataType extends ClientInfoType {
  [key: string]: any;
}

export interface NodeOptionsType extends BaseOptionsType {
  /**
   * 自定义请求函数
   */
  sendFunc?: (url: string, data: IAnyObject) => Promise<InterfaceResponseType<any>>;
}

export enum NodeErrorTypes {
  UNCAUGHTEXCEPTION = 'uncaughtException',
  UNHANDLEDREJECTION = 'unhandledrejection'
}
