import { ReportDataMsgType } from '@heimdallr-sdk/types';

export enum WxErrorTypes {
  UNCAUGHTEXCEPTION = 'uncaughtException'
}

export interface WxErrorDataType {
  err: string;
}

export interface WxErrorMsgType extends ReportDataMsgType, WxErrorDataType {}

export interface WxErrorType extends ReportDataMsgType, WxErrorDataType {}
