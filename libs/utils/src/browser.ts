import { StoreType, StoreTypes, TAG } from '@heimdallr-sdk/types';

const getStoreIns = (type: StoreTypes) => {
  let store = null;
  switch (type) {
    case StoreType.LOCAL:
      store = localStorage;
      break;
    case StoreType.SESSION:
      store = sessionStorage;
      break;
    default:
      break;
  }
  return store;
};

/**
 * 读取 localStorage 或 sessionStorage
 * @param {StoreTypes} type
 * @param {string} keyPath
 * @param {boolean} needParse 是否需要解析json串
 * @return
 */
export const getStore = <T>(type: StoreTypes, keyPath: string, needParse = true) => {
  if (!type || !keyPath) {
    return '';
  }
  const store = getStoreIns(type);
  if (!store) {
    return '';
  }
  let result = '';
  try {
    const paths = keyPath.split('.');
    const [key] = paths;
    result = store.getItem(key);
    if (needParse) {
      result = JSON.parse(result);
      if (paths.length > 1) {
        result = paths.slice(1).reduce((pre, cur) => pre[cur], result);
      }
    }
  } catch (err) {
    console.error(TAG, err);
  }
  return result as T;
};

/**
 * 存入 localStorage 或 sessionStorage
 * @param {string} type
 * @param {string} key
 * @param {any} data
 */
export const setStore = (type: StoreType, key: string, data: any) => {
  if (!key) {
    return;
  }
  const store = getStoreIns(type);
  if (!store) {
    return;
  }
  store.setItem(key, JSON.stringify(data));
};

/**
 * 写入cookies
 * @param {string} key
 * @param {any} value
 * @param {number} days 保存天数
 */
export const setCookie = (key: string, value: any, days: number) => {
  if (!key || !value || !days) {
    return;
  }
  const exp = new Date(); // 获得当前时间
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000); // 换成毫秒
  document.cookie = `${key}=${encodeURIComponent(value)};expires=${exp.toUTCString()}`;
};
/**
 * 读取cookie
 * @param {string} key
 * @returns {string}
 */
export const getCookie = (key: string) => {
  if (!key) {
    return '';
  }
  const arr = document.cookie.match(new RegExp(`(^| )${key}=([^;]*)(;|$)`));
  if (arr != null) {
    return decodeURIComponent(arr[2]);
  }
  return '';
};

/**
 * 删除指定cookie
 * @param key
 */
export const delCookie = (key: string) => {
  if (!key) {
    return;
  }
  const exp = new Date(); // 当前时间
  exp.setTime(exp.getTime() - 1);
  const cval = getCookie(key);
  if (cval != null) {
    document.cookie = `${key}=${cval};expires=${exp.toUTCString()}`;
  }
};
