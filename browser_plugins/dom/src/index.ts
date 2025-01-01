import { BasePluginType, BrowserBreadcrumbTypes, DomTypes, EventTypes, ReportDataType } from '@heimdallr-sdk/types';
import { generateUUID, throttle } from '@heimdallr-sdk/utils';
import { DomMsgType, DomOptions } from './types';
import { htmlElementAsString } from './lib';

export interface DomCollectedType {
  doc: Document;
  ev: MouseEvent;
}

function domPlugin(options: DomOptions = {}): BasePluginType {
  const { throttleDelayTime = 300, sensitiveClasses, sensitiveTags = [] } = options;
  return {
    name: 'domPlugin',
    monitor(notify: (collecteData: DomCollectedType) => void) {
      const clickThrottle = throttle(notify, throttleDelayTime);
      document.addEventListener(
        'click',
        function (ev) {
          clickThrottle({
            doc: this,
            ev,
          });
        },
        true
      );
    },
    transform(collectedData: DomCollectedType): ReportDataType<DomMsgType> {
      const { doc, ev } = collectedData;
      const active = doc.activeElement as HTMLElement;
      if (!active) {
        return null;
      }
      const htmlString = htmlElementAsString(active, sensitiveClasses, sensitiveTags);
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
          st: DomTypes.CLICK,
          ele: htmlString,
          x: pageX,
          y: pageY
        }
      };
    }
  };
}

export default domPlugin;
