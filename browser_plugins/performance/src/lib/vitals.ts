import { formatDecimal } from '@heimdallr-sdk/utils';
import { getLCP, getFID, getCLS, Metric } from 'web-vitals';

interface VitalsType {
  lcp: number; // 最大内容渲染时间，2.5s内
  fid: number; // 交互性能，应小于 100ms
  cls: number; // 视觉稳定性，应小于 0.1
}

function fetchLcp(): Promise<number> {
  return new Promise((rs) => {
    getLCP((val: Metric) => {
      rs(val.value);
    });
  });
}

function fetchFid(): Promise<number> {
  return new Promise((rs) => {
    getFID((val: Metric) => {
      rs(val.value);
    });
  });
}

function fetchCls(): Promise<number> {
  return new Promise((rs) => {
    getCLS((val: Metric) => {
      rs(val.value);
    });
  });
}

export default function (): Promise<VitalsType> {
  return new Promise((rs) => {
    Promise.all([fetchLcp(), fetchFid(), fetchCls()]).then((results) => {
      const [lcp, fid, cls] = results;
      rs({
        lcp: formatDecimal(lcp, 3),
        fid: formatDecimal(fid, 3),
        cls: formatDecimal(cls, 3)
      });
    });
  });
}
