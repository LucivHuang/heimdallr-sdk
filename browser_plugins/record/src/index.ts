import { record } from 'rrweb';
import { BasePluginType, EventTypes, ReportDataType, BrowserReportType } from '@heimdallr-sdk/types';
import { generateUUID, countBytes } from '@heimdallr-sdk/utils';
import { recordOptions } from 'rrweb/typings/types';
import { eventWithTime } from '@rrweb/types';
import { RecordDataType, RecordMsgType, RecordTypes } from './types';

function recordPlugin(options?: recordOptions<eventWithTime>): BasePluginType {
  const MIN_EVENT_SIZE = 50176;
  const MAX_EVENT_SIZE = 55296;

  function encodeRecordNodes(node) {
    const { childNodes = [] } = node || {};
    for (const child of childNodes) {
      if (child.textContent) {
        child.textContent = encodeURIComponent(child.textContent);
      } else {
        encodeRecordNodes(child);
      }
    }
  }

  return {
    name: 'recordPlugin',
    monitor(notify: (data: RecordDataType) => void) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const client = this;
      const { uploadUrl } = this.getContext();
      let stopFnc = null;
      let events = [];
      window.addEventListener('load', () => {
        stopFnc = record({
          sampling: {
            // set the interval of media interaction event
            media: 800,
            input: 'last' // 连续输入时，只录制最终值
          },
          ...options,
          emit(event) {
            encodeRecordNodes((event.data as any).node);
            const eventCurrentSize = countBytes(JSON.stringify(events));
            if (!client.appID) {
              events.push(event);
              return;
            }
            // sendBeacon 最大支持 64KB，预留 10KB ~ 15KB
            if (eventCurrentSize >= MIN_EVENT_SIZE && eventCurrentSize <= MAX_EVENT_SIZE) {
              notify({ evs: events });
              events = [];
            } else if (eventCurrentSize > MAX_EVENT_SIZE) {
              client.report(
                uploadUrl,
                client.transform({
                  aid: client.appID,
                  lid: generateUUID(),
                  t: client.getTime(),
                  e: EventTypes.RECORD,
                  dat: {
                    st: RecordTypes.SESSION,
                    evs: events
                  }
                }),
                BrowserReportType.POST
              );
              events = [];
            }
            events.push(event);
          }
        });
      });
      window.addEventListener('unload', () => {
        if (!stopFnc) {
          return;
        }
        stopFnc();
        if (!events.length) {
          return;
        }
        notify({
          evs: events
        });
      });
    },
    transform(collectedData: RecordDataType): ReportDataType<RecordMsgType> {
      return {
        lid: generateUUID(),
        t: this.getTime(),
        e: EventTypes.RECORD,
        dat: {
          st: RecordTypes.SESSION,
          ...collectedData
        }
      };
    }
  };
}
export default recordPlugin;
