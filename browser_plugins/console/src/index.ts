import { BasePluginType, BrowserBreadcrumbTypes, ConsoleTypes, EventTypes, ReportDataType } from '@heimdallr-sdk/types';
import { generateUUID, replaceOld } from '@heimdallr-sdk/utils';
import { ConsoleDataMsgType, ConsoleMsgType } from './types';

function consolePlugin(): BasePluginType {
  const logType = ['log', 'info', 'warn', 'error', 'assert'];
  return {
    name: 'consolePlugin',
    monitor(notify: (data: ConsoleDataMsgType) => void) {
      if (!window.console) {
        return;
      }
      const { debug } = this.getContext();
      logType.forEach((level: ConsoleTypes) => {
        replaceOld(window.console, level, function (originalConsole: () => any): Function {
          return function (...args: any[]): void {
            if (originalConsole) {
              notify({
                args,
                level
              });
              if (debug) {
                originalConsole.apply(window.console, args);
              }
            }
          };
        });
      });
    },
    transform(collectedData: ConsoleDataMsgType): ReportDataType<ConsoleMsgType> {
      const lid = generateUUID();
      const { args, level } = collectedData;
      // 添加用户行为栈
      this.breadcrumb.unshift({
        lid,
        bt: BrowserBreadcrumbTypes.CONSOLE,
        msg: `Console output "${args.join(',')}" "${level}"`,
        t: this.getTime()
      });
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.CONSOLE,
        dat: {
          st: collectedData.level,
          ...collectedData
        }
      };
    }
  };
}

export default consolePlugin;
