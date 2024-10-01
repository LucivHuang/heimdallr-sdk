import { ReportDataMsgType } from "@heimdallr-sdk/types";

export interface PerformanceBasicMsgType extends ReportDataMsgType {
  dnsSearch: number; // DNS 解析耗时
  tcpConnect: number; // TCP 连接耗时
  sslConnect: number; // SSL安全连接耗时
  request: number; // TTFB 网络请求耗时
  response: number; // 数据传输耗时
  parseDomTree: number; // DOM 解析耗时
  resource: number; // 资源加载耗时
  domReady: number; // DOM Ready
  httpHead: number; // http 头部大小
  interactive: number; // 首次可交互时间
  complete: number; // 页面完全加载
  redirect: number; // 重定向次数
  redirectTime: number; // 重定向耗时
  duration: number;
  fp: number; // 渲染出第一个像素点，白屏时间
  fcp: number; // 渲染出第一个内容，首屏结束时间
}
interface ResourceType {
  f: string;
  t: number;
}

export interface PerformanceSingleMsgType extends ReportDataMsgType {
  value: number | ResourceType[];
}

export interface PerformanceVitalsMsgType extends ReportDataMsgType {
  lcp: number;
  fid: number;
  cls: number;
}

export enum PerformanceFeat {
  BASIC = 'basic',
  RESOURCE = 'resource',
  FMP = 'fmp',
  FPS = 'fps',
  VITALS = 'vitals'
}

export interface PerformanceOptions {
  performancOff?: PerformanceFeat[]
}
