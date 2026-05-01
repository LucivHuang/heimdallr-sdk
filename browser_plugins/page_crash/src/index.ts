import { BasePluginType, ClientInfoType, PlatformTypes, StoreKeyType, StoreType, TAG } from '@heimdallr-sdk/types';
import { generateUUID, getCookie, getStore } from '@heimdallr-sdk/utils';

export interface PageCrashPluginOptions {
  /**
   * serviceWorker鍦板潃
   */
  pageCrashWorkerUrl?: string;
}

// 鑴辩 鍙戝竷璁㈤槄 鏂瑰紡锛岃蛋 webWorker 鏂瑰紡

function pageCrashPlugin(options: PageCrashPluginOptions = {}): BasePluginType {
  const { pageCrashWorkerUrl } = options;
  const HEARTBEAT_INTERVAL = 5 * 1000; // 5绉掍竴娆?
  return {
    name: 'pageCrashPlugin',
    monitor() {
      if (typeof Worker === 'undefined') {
        return;
      }
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
      const sid = getStore<string>(StoreType.SESSION, StoreKeyType.SESSION_ID);
      const uid = getCookie(StoreKeyType.USER_ID);
      const clientInfo: ClientInfoType = {
        aid, // 应用ID
        sid, // 会话ID
        uid,
        p: PlatformTypes.BROWSER,
        ttl: title, // 页面标题
        url: href, // 页面路径
        lan: language, // 浏览器语言
        ua: userAgent, // 浏览器用户代理
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
  };
}

export default pageCrashPlugin;
