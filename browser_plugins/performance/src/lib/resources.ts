import { formatDecimal } from '@heimdallr-sdk/utils';
import { ResourceItem } from '../types';

const getResource = (): ResourceItem[] =>
  performance.getEntriesByType('resource').map((item: PerformanceResourceTiming) => ({
    f: item.name,
    t: formatDecimal(item.responseEnd, 3)
  }));

export default getResource;
