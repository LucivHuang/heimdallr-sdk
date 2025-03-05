import { IAnyObject } from '@heimdallr-sdk/types';

/**
 * 格式化url地址
 * @param {string} host - 域名地址
 * @param {string} path - 接口路径
 * @return {string}
 */
export const formateUrlPath = (host: string, path: string): string =>
  `${/^http(s|):\/\//.test(host || '') ? host : `//${(host || '').replace(/^http(s|):\/\//, '')}`}/${
    (path || '')[0] === '/' ? path.substring(1) : path
  }`;

/**
 * 获取 URL 路径地址
 * @param {string} url - 完整的 URL 地址
 * @return {string} 返回标准化路径
 */
 export const getUrlPath = (url: string): string => {
  if (!url) return '';
  if (!/^[a-zA-Z]+:\/\//.test(url)) {
    url = url.startsWith('/') ? `http://dummyhost${url}` : `http://${url}`;
  }
  const match = url.match(/^[a-zA-Z]+:\/\/(?:[^/?#]*@)?([^/?#]*)(\/[^?#]*)?/);
  let path = match?.[2] || '';
  if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);
  return path || '/';
};

/**
 * 给url添加query
 * @param url
 * @param query
 */
export const setUrlQuery = (url: string, query = {}) => {
  const queryArr = [];
  Object.keys(query).forEach((k) => {
    queryArr.push(`${k}=${query[k]}`);
  });
  return `${url}${url.indexOf('?') !== -1 ? '&' : '?'}${queryArr.join('&')}`;
};

/**
 * 获取对象属性值
 * @param {string} keyPath 属性路径
 * @param obj 目标对象
 */
export const getDeepPropByDot = (keyPath: string, obj: Object) => {
  if (!keyPath || !obj) {
    return null;
  }
  const copyTarget = { ...obj };
  const paths = keyPath.split('.');
  let result = copyTarget;
  for (const key of paths) {
    const value = result[key];
    if (!value) {
      return null;
    }
    result = value;
  }
  return result;
};

/**
 * 将对象转换为 URL 查询字符串
 * @param {IAnyObject} params - 请求参数
 * @return {string} 查询字符串
 */
export const obj2query = (params: IAnyObject) =>
  Object.keys(params)
    .map((key) => {
      const value = params[key];
      return `${encodeURIComponent(key)}=${encodeURIComponent(typeof value !== 'string' ? JSON.stringify(value) : value)}`
    })
    .join('&');
