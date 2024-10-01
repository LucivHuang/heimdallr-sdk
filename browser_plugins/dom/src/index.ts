import { BasePluginType, BrowserBreadcrumbTypes, DomTypes, EventTypes, ReportDataType } from '@heimdallr-sdk/types';
import { generateUUID, throttle } from '@heimdallr-sdk/utils';
import { DomMsgType, DomOptions } from './types';
import { htmlElementAsString } from './lib';

export interface DomCollectedType {
  category: DomTypes;
  doc: Document;
  ev: MouseEvent;
}

function domPlugin(options: DomOptions = {}): BasePluginType {
  return {
    name: 'domPlugin',
    monitor(notify: (collecteData: DomCollectedType) => void) {
      const { throttleDelayTime = 300 } = options;
      const clickThrottle = throttle(notify, throttleDelayTime);
      document.addEventListener(
        'click',
        function (ev) {
          clickThrottle({
            category: DomTypes.CLICK,
            doc: this,
            ev,
          });
        },
        true
      );
    },
    transform(collectedData: DomCollectedType): ReportDataType<DomMsgType> {
      const { category, doc, ev } = collectedData;
      const active = doc.activeElement as HTMLElement;
      const htmlString = htmlElementAsString(active);
      if (!htmlString) {
        return null;
      }
      const { pageX, pageY } = ev;
      // 添加用户行为栈
      const lid = generateUUID();
      this.breadcrumb.unshift({
        lid,
        bt: BrowserBreadcrumbTypes.CLICK,
        msg: `Click ${htmlString}`,
        t: this.getTime()
      });
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.DOM,
        dat: {
          st: category,
          ele: htmlString,
          x: pageX,
          y: pageY
        }
      };
    }
  };
}

export default domPlugin;
