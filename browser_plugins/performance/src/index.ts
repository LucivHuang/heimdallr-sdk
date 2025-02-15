import { BasePluginType, EventTypes, ReportDataType } from "@heimdallr-sdk/types";
import { generateUUID } from "@heimdallr-sdk/utils";
import getNetworkMetrics from "./lib/network";
import getPageLoadMetrics from "./lib/pl";
import getRenderMetrics from "./lib/render";
import getResource from "./lib/resources";
import { PerformanceFeat, PerformanceMsgType, PerformanceOptions } from "./types";

function perPlugin(options: PerformanceOptions = {}): BasePluginType {
  const { off = [] } = options;
  return {
    name: 'perPlugin',
    monitor(notify: (data: PerformanceMsgType) => void) {
      window.addEventListener(
        'load',
        () => {
          if (!off.includes(PerformanceFeat.NETWORK)) {
            notify({
              st: PerformanceFeat.NETWORK,
              dat: getNetworkMetrics()
            });
          }
          if (!off.includes(PerformanceFeat.PAGELOAD)) {
            notify({
              st: PerformanceFeat.PAGELOAD,
              dat: getPageLoadMetrics()
            });
          }
          if (!off.includes(PerformanceFeat.RENDER)) {
            getRenderMetrics().then((dat) => {
              notify({
                st: PerformanceFeat.RENDER,
                dat
              });
            });
          }
          if (!off.includes(PerformanceFeat.RESOURCE)) {
            notify({
              st: PerformanceFeat.RESOURCE,
              dat: getResource()
            });
          }
        },
        true
      );
    },
    transform(collectedData: PerformanceMsgType): ReportDataType<PerformanceMsgType> {
      return {
        lid: generateUUID(),
        t: this.getTime(),
        e: EventTypes.PERFORMANCE,
        dat: {
          ...collectedData
        }
      };
    }
  };
}

export default perPlugin;
