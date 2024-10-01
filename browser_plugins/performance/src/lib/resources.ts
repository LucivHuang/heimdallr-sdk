import { formatDecimal } from "@heimdallr-sdk/utils";

export default function () {
  return performance.getEntriesByType('resource').map((item: PerformanceResourceTiming) => ({
    f: item.name,
    t: formatDecimal(item.responseEnd, 3)
  }));
}
