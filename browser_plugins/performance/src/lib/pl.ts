import { formatDecimal } from '@heimdallr-sdk/utils';
import { PageLoadMetrics } from '../types';

const getPageLoadMetrics = (): PageLoadMetrics => {
  const [timing] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const { loadEventStart, domInteractive, domContentLoadedEventEnd, duration, responseEnd, fetchStart } = timing;
  return {
    domParse: formatDecimal(domInteractive - responseEnd, 3),
    resLoad: formatDecimal(loadEventStart - domContentLoadedEventEnd, 3),
    domReady: formatDecimal(domContentLoadedEventEnd - fetchStart, 3),
    load: formatDecimal(loadEventStart - fetchStart, 3),
    duration: formatDecimal(duration, 3)
  };
};

export default getPageLoadMetrics;
