import { formatDecimal } from '@heimdallr-sdk/utils';
import { NetworkMetrics } from '../types';

const getNetworkMetrics = (): NetworkMetrics => {
  const [timing] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const {
    domainLookupEnd,
    domainLookupStart,
    connectEnd,
    connectStart,
    secureConnectionStart,
    responseStart,
    requestStart,
    responseEnd,
    transferSize,
    encodedBodySize,
    redirectEnd,
    redirectStart,
    redirectCount
  } = timing;
  return {
    dns: formatDecimal(domainLookupEnd - domainLookupStart, 3),
    tcp: formatDecimal(connectEnd - connectStart, 3),
    ssl: formatDecimal(connectEnd - secureConnectionStart, 3),
    ttfb: formatDecimal(responseStart - requestStart, 3),
    trans: formatDecimal(responseEnd - responseStart, 3),
    headerSize: formatDecimal(encodedBodySize - transferSize, 3),
    redirectNum: formatDecimal(redirectCount, 3),
    redirect: formatDecimal(redirectEnd - redirectStart, 3)
  };
};

export default getNetworkMetrics;
