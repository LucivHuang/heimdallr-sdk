import { BasePluginType, ClientInfoType, PlatformTypes, StoreKeyType, StoreType, TAG } from '@heimdallr-sdk/types';
import { generateUUID, getStore, getCookie } from '@heimdallr-sdk/utils';

export interface PageCrashPluginOptions {
  /**
   * serviceWorker地址
   */
  pageCrashWorkerUrl?: string;
}

// 脱离 发布订阅 方式，走 webWorker 方式

function pageCrashPlugin(options: PageCrashPluginOptions = {}): BasePluginType {
  const { pageCrashWorkerUrl } = options;
  const HEARTBEAT_INTERVAL = 5 * 1000; // 5秒一次
  return {
    name: 'pageCrashPlugin',
    monitor() {
      if (Worker) {
        if (!pageCrashWorkerUrl) {
          console.warn(TAG, 'Missing pageCrashWorkerUrl in options');
          return;
        }
        const crashWorker = new Worker(pageCrashWorkerUrl);
        const { uploadUrl } = this.getContext();
        const workerSessionId = generateUUID();
        const { userAgent, language } = navigator;
        const { title, documentElement, body } = document;
        const { href } = location;
        const { innerWidth, innerHeight } = window;
        const aid = getStore<string>(StoreType.LOCAL, StoreKeyType.APP);
        const sid = getStore<string>(StoreType.LOCAL, StoreKeyType.SESSION_ID);
        const uid = getCookie(StoreKeyType.USER_ID)
        const clientInfo: ClientInfoType = {
          aid, // 应用id
          sid, // 会话id
          uid,
          p: PlatformTypes.BROWSER,
          ttl: title, // 页面标题
          url: href, // 页面路径
          lan: language, // 站点语言
          ua: userAgent, // 浏览器标识
          ws: `${innerWidth}x${innerHeight}`,
          ds: `${documentElement.clientWidth || body.clientWidth}x${documentElement.clientHeight || body.clientHeight}`
        };
        const data = {
          sendUrl: uploadUrl,
          clientInfo
        };
        const heartbeat = () => {
          const [lastOperate] = this.breadcrumb.getStack();
          crashWorker.postMessage({
            type: 'heartbeat',
            id: workerSessionId,
            data: {
              stack: [lastOperate],
              ...data
            }
          });
        };
        window.addEventListener('beforeunload', () => {
          const [lastOperate] = this.breadcrumb.getStack();
          crashWorker.postMessage({
            type: 'unload',
            id: workerSessionId,
            data: {
              stack: [lastOperate],
              ...data
            }
          });
        });
        setInterval(heartbeat, HEARTBEAT_INTERVAL);
        heartbeat();
      }
    }
  };
}

export default pageCrashPlugin;
