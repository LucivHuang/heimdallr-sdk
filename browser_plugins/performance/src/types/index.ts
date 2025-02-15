import { ReportDataMsgType } from '@heimdallr-sdk/types';

export enum PerformanceFeat {
  /** 网络延迟相关 */
  NETWORK = 31,
  /** 页面加载相关 */
  PAGELOAD,
  /** 首屏渲染及交互相关 */
  RENDER,
  /** 资源加载明细 */
  RESOURCE
}

export interface NetworkMetrics {
  dns: number;
  tcp: number;
  ssl: number;
  ttfb: number;
  trans: number;
  redirectNum: number;
  redirect: number;
  headerSize: number;
}

export interface PageLoadMetrics {
  domParse: number;
  resLoad: number;
  domReady: number;
  load: number;
  duration: number;
}

export interface RenderMetrics {
  fp: number;
  fcp: number;
  lcp: number;
  tti: number;
  inp: number;
  cls: number;
  fps: number;
  fmp: number;
}

export interface ResourceItem {
  f: string;
  t: number;
}

export interface PerformanceMsgType extends ReportDataMsgType {
  st: PerformanceFeat;
  dat: NetworkMetrics | PageLoadMetrics | RenderMetrics | ResourceItem[];
}

export interface PerformanceOptions {
  off?: PerformanceFeat[];
}
