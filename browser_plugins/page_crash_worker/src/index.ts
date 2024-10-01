import { BrowserBreadcrumbTypes, BrowserErrorTypes, EventTypes, BreadcrumbLevel } from '@heimdallr-sdk/types';
import { get } from '@heimdallr-sdk/utils';
import { CrashErrorType } from './types';

// 运行在 webWorker

const TAG = '[@heimdallr-sdk/page-crash-worker]:';

class PageCrashWorker {
  private readonly CHECK_CRASH_INTERVAL = 10 * 1000; // 每 10s 检查一次
  private readonly CRASH_THRESHOLD = 15 * 1000; // 15s 超过15s没有心跳则认为已经 crash
  private pages = {};
  private timer = null;
  private stack = [];

  constructor() {
    console.info(TAG, 'webWorker running');
    this.init();
  }

  init() {
    onmessage = (e) => {
      const { id, type = '', data: detail = {} } = e.data || {};
      this.stack = detail.stack || [];
      switch (type) {
        case 'heartbeat':
          this.pages[id] = {
            t: Date.now()
          };
          if (!this.timer) {
            this.timer = setInterval(() => {
              this.checkCrash(detail);
            }, this.CHECK_CRASH_INTERVAL);
          }
          break;
        case 'unload':
          delete this.pages[id];
          break;
        default:
          break;
      }
    };
  }

  checkCrash(data: CrashErrorType) {
    const now = Date.now();
    const { sendUrl, clientInfo } = data;
    const href = clientInfo.url;
    for (const id in this.pages) {
      const page = this.pages[id];
      if (now - page.t > this.CRASH_THRESHOLD) {
        delete this.pages[id];
        // 用户行为栈
        const b = [
          {
            id,
            bt: BrowserBreadcrumbTypes.CRASH,
            l: BreadcrumbLevel.FATAL,
            msg: `Crash on ${href}`,
            t: new Date().getTime()
          },
          ...this.stack
        ];
        // 上报 crash
        get(sendUrl, {
          lid: id,
          t: new Date().getTime(),
          e: EventTypes.ERROR,
          b,
          ...clientInfo,
          dat: {
            st: BrowserErrorTypes.PAGECRASH,
            href
          }
        });
      }
    }
    if (Object.keys(this.pages).length == 0) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export default PageCrashWorker;
