import {
  BasePluginType,
  CustomerOptionType,
  EventTypes,
  PageLifeType,
  ReportDataType,
  StoreKeyType,
  StoreType,
  TAG
} from '@heimdallr-sdk/types';
import { generateUUID, getCookie, getStore, getDeepPropByDot, setStore } from '@heimdallr-sdk/utils';
import { LifecycleDataType, LifeCycleMsgType, LifecycleOptions } from '../types';

function getStoreUserId(userIdentify: CustomerOptionType = {}): string {
  const { name = '', position = '' } = userIdentify;
  switch (position) {
    case StoreType.LOCAL:
    case StoreType.SESSION:
      return getStore(position, name);
    case StoreType.COOKIE:
      return getCookie(name);
    case StoreType.GLOBAL:
      return getDeepPropByDot(name, window) as string;
    default:
      break;
  }
  return '';
}

function getIds(userIdentify: CustomerOptionType) {
  let acc = '';
  const { name: userPath, position: userPosi } = userIdentify;
  if (userPath && userPosi) {
    acc = getStoreUserId(userIdentify);
    if (!acc) {
      console.warn(TAG, `${userPath} does not exist on ${userPosi}`);
    }
  }
  return {
    acc
  };
}

function lifeCyclePlugin(options: LifecycleOptions = {}): BasePluginType {
  const { userIdentify = {} } = options;
  return {
    name: 'lifeCyclePlugin',
    monitor(notify: (data: LifecycleDataType) => void) {
      window.addEventListener('load', () => {
        this.sessionID = getStore(StoreType.SESSION, StoreKeyType.SESSION_ID);
        if (!this.sessionID) {
          this.sessionID = generateUUID();
          setStore(StoreType.SESSION, StoreKeyType.SESSION_ID, this.sessionID);
        }
        notify({
          lt: PageLifeType.LOAD,
          href: location.href,
          ...getIds.call(this, userIdentify)
        });
      });
      window.addEventListener('unload', () => {
        notify({
          lt: PageLifeType.UNLOAD,
          href: location.href,
          ...getIds.call(this, userIdentify)
        });
      });
    },
    transform(collectedData: LifecycleDataType): ReportDataType<LifeCycleMsgType> {
      const lid = generateUUID();
      const { lt } = collectedData;
      let b = [];
      switch (lt) {
        case PageLifeType.UNLOAD:
          b = [...this.breadcrumb.getStack()];
          break;
        default:
          break;
      }
      delete collectedData.lt;
      // 上报数据
      return {
        lid,
        t: this.getTime(),
        e: EventTypes.LIFECYCLE,
        b,
        dat: {
          st: lt,
          ...collectedData
        }
      };
    }
  };
}

export default lifeCyclePlugin;
