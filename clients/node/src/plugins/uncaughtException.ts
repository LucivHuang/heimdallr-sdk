import { BasePluginType, EventTypes, ReportDataType, ConsoleTypes } from '@heimdallr-sdk/types';
import { generateUUID } from '@heimdallr-sdk/utils';
import { NodeErrorTypes, UncaughtExceptionDataType } from '../types';
interface CollectedType {
  category: EventTypes;
  data: Error;
}

function uncaughtExceptionPlugin(): BasePluginType {
  return {
    name: 'uncaughtExceptionPlugin',
    monitor(notify: (data: CollectedType) => void) {
      process.on('uncaughtException', (e) => {
        console.log(e, ConsoleTypes.ERROR);
        notify({
          category: EventTypes.ERROR,
          data: e
        });
      });
    },
    transform(collectedData: CollectedType): ReportDataType<UncaughtExceptionDataType> {
      const {
        category,
        data: { message, name, stack = '' }
      } = collectedData;
      return {
        lid: generateUUID(),
        t: Date.now(),
        e: category,
        dat: {
          st: NodeErrorTypes.UNCAUGHTEXCEPTION,
          name,
          msg: message,
          stk: stack
        }
      };
    }
  };
}

export default uncaughtExceptionPlugin;
