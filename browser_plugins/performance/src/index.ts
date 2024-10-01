import { BasePluginType, EventTypes, PerTypes, ReportDataType } from '@heimdallr-sdk/types';
import { PerformanceBasicMsgType, PerformanceFeat, PerformanceOptions, PerformanceSingleMsgType, PerformanceVitalsMsgType } from './types';
import { generateUUID } from '@heimdallr-sdk/utils';
import getBasic from './lib/basic';
import getVitals from './lib/vitals';
import getResources from './lib/resources';
import FPSTool from './lib/fps';
import FMPTiming from './lib/fmp';

type CollectedData = PerformanceSingleMsgType | PerformanceBasicMsgType | PerformanceVitalsMsgType;

function perPlugin(options: PerformanceOptions = {}): BasePluginType {
  // 禁用标识
  const { performancOff = [] } = options;
  return {
    name: 'perPlugin',
    monitor(notify: (data: CollectedData) => void) {
      const fpsTool = new FPSTool();
      // fmp
      if (!performancOff.includes(PerformanceFeat.FMP)) {
        const fmpTiming = new FMPTiming();
        fmpTiming.initObserver().then((fmp) => {
          notify({
            st: PerTypes.FMP,
            value: fmp
          });
        });
      }
      // vitals
      if (!performancOff.includes(PerformanceFeat.VITALS)) {
        getVitals().then((vitals) => {
          notify({
            st: PerTypes.VITALS,
            ...vitals
          });
        });
      }
      window.addEventListener(
        'load',
        () => {
          // 基础参数
          if (!performancOff.includes(PerformanceFeat.BASIC)) {
            notify({
              st: PerTypes.BASIC,
              ...getBasic()
            });
          }
          // 资源耗时
          if (!performancOff.includes(PerformanceFeat.RESOURCE)) {
            notify({
              st: PerTypes.RESOURCE,
              value: getResources()
            });
          }
          // fps
          if (!performancOff.includes(PerformanceFeat.FPS)) {
            fpsTool.run();
            setTimeout(() => {
              notify({
                st: PerTypes.FPS,
                value: fpsTool.get()
              });
              fpsTool.destroy();
            }, 500);
          }
        },
        true
      );
    },
    transform(collectedData: CollectedData): ReportDataType<CollectedData> {
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
