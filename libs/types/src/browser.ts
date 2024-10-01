import { ReportDataMsgType } from './base';

export interface LinkMsgDataType {
  href?: string;
}

export interface RouteDataMsgType {
  from: string;
  to: string;
}

export interface RouteMsgType extends ReportDataMsgType, RouteDataMsgType {}

// 通用上报结构
export interface IAnyMsgType extends ReportDataMsgType {
  [key: string]: any;
}
