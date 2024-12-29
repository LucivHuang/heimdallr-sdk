import {
  BasePluginType,
  BreadcrumbLevel,
  BrowserBreadcrumbTypes,
  BrowserErrorTypes,
  EventTypes,
  ReportDataType,
  TAG
} from '@heimdallr-sdk/types';
import { generateUUID } from '@heimdallr-sdk/utils';
import { PromiseErrorType } from '../types';

interface CollectedType {
  category: EventTypes;
  data: PromiseRejectionEvent;
}

const PromiseErrorPlugin: BasePluginType = {
  name: 'promiseErrorPlugin',
  monitor(notify: (data: CollectedType) => void) {
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      e.preventDefault();
      console.error(TAG, e);
      notify({
        category: EventTypes.ERROR,
        data: e
      });
    });
  },
  transform(collectedData: CollectedType): ReportDataType<PromiseErrorType> {
    const {
      category,
      data: { reason }
    } = collectedData;
    let msg: string;
    if (typeof reason === 'string') {
      msg = reason;
    } else if (typeof reason === 'object' && reason.stack) {
      msg = reason.stack;
    }
    const lid = generateUUID();
    this.breadcrumb.unshift({
      lid,
      bt: BrowserBreadcrumbTypes.UNHANDLEDREJECTION,
      l: BreadcrumbLevel.ERROR,
      msg,
      t: this.getTime()
    });
    return {
      lid,
      t: this.getTime(),
      e: category,
      dat: {
        st: BrowserErrorTypes.UNHANDLEDREJECTION,
        msg,
      }
    };
  }
};

export default PromiseErrorPlugin;
