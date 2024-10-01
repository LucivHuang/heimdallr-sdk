import { ReportDataMsgType } from './base';
import { IAnyObject } from './common';
import { MethodTypes } from './constant';

export interface XhrResponse<T> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

export interface HttpCommonRes<T = any> {
  code: number;
  data: T;
  msg: string;
}

export interface HttpRequest {
  /** 请求方法 */
  m: MethodTypes | string;
  /** 请求url */
  url: string;
  /** 请求参数（体） */
  dat?: IAnyObject;
}

export interface HttpResponse {
  /** 响应状态 */
  sta?: number;
  /** 响应数据 */
  dat?: IAnyObject | string;
  /** 响应消息 */
  msg?: string;
}

export interface HttpCollectDataType {
  /** 请求 */
  req: HttpRequest;
  /** 响应 */
  res: HttpResponse;
  /** 时间戳 */
  t: number;
  /** 运行时间（毫秒） */
  et?: number;
}

export interface HttpCollectType extends ReportDataMsgType, HttpCollectDataType {}
