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
 * @return {string} 返回路径部分
 */
 export const getUrlPath = (url: string): string => {
   const hasProtocol = /^[a-zA-Z]+:\/\//.test(url);
  try {
    // 使用 URL 对象解析
    const { pathname } = new URL(url, hasProtocol ? undefined : 'http://temporaryurl.com');
    // 确保路径不包含尾部斜杠
    return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  } catch (error) {
    // 处理无效 URL 的情况
    return '';
  }
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
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
