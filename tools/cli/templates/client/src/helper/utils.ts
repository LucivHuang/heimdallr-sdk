import { IAnyObject } from './types';
import { toRefs } from 'vue';

/**
 * 获取当前时间之前或之后的日期
 * @param {number} index - 指定天数（正数获取之后的日期，负数获取之前的日期）
 * @param {string} format - 日期格式
 * @return {Array<string>}
 */
export const getDateRange = (index: number, format = 'yyyy-MM-dd'): string[] => {
  const date = new Date();
  const newDate = new Date();
  const minuts = date.getTime() + 1000 * 60 * 60 * 24 * index;
  newDate.setTime(minuts); // 新日期
  const arr = [];
  for (let k = newDate.getTime(); k <= date.getTime(); ) {
    k = k + 24 * 60 * 60 * 1000;
    arr.push(formatDate(new Date(k), format));
  }
  return arr;
};

/**
 * 格式化时间
 * @param {number} Dtime - 目标时间
 * @param {string} format - 日期格式
 * @return {string}
 */
export const formatDate = (Dtime: Date | string, format = 'yyyy-MM-dd hh:mm:ss'): string => {
  let date: Date;
  if (Dtime instanceof Date) {
    date = Dtime;
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, `${Dtime.getFullYear()}`.substr(4 - RegExp.$1.length));
    }
  } else {
    if (/(y+)/.test(format)) {
      date = new Date(parseInt(Dtime.slice(6, 19)));
      if (!date || date.toUTCString() === 'Invalid Date') {
        return '';
      }
    } else {
      date = new Date();
    }
  }
  const map = {
    M: date.getMonth() + 1, // 月份
    d: date.getDate(), // 日
    h: date.getHours(), // 小时
    m: date.getMinutes(), // 分
    s: date.getSeconds(), // 秒
    q: Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  };
  format = format.replace(/([yMdhmsqS])+/g, (all, t) => {
    let v = map[t];
    if (v !== undefined) {
      if (all.length > 1) {
        v = `0${v}`;
        v = v.substr(v.length - 2);
      }
      return v;
    } else if (t === 'y') {
      return `${date.getFullYear()}`.substr(4 - all.length);
    }
    return all;
  });
  return format;
};

/**
 * 格式化数值
 * @param {number} num
 * @return {string}
 */
export const formateNum = (num: number): string => {
  if (num / 10000 >= 1) {
    return `${(num / 10000).toFixed(2)}w`;
  } else if (num / 1000 >= 1) {
    return `${(num / 1000).toFixed(2)}k`;
  }
  return `${num}`;
};

/**
 * 存储 localStorage 信息
 * @param {string} key - 存储键值
 * @param {any} val - 存储信息
 * @return {boolean}
 */
export const setLocalStore = (key: string, val: any): boolean => {
  if (!key) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * 读取 localStorage 信息
 * @param {string} key - 存储键值
 * @return {any}
 */
export const getLocalStore = (key: string): any => {
  if (!key) {
    return false;
  }
  try {
    const str = window.localStorage.getItem(key);
    if (!str) {
      return str;
    }
    let datas = '';
    datas = JSON.parse(str);
    return datas;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * 存储 cookie 信息
 * @param {string} key - 存储键值
 * @param {string} val - 存储信息
 * @param {number} days - 有效天数
 */
export const setCookie = (key: string, val: string, days: number): void => {
  const exp = new Date();
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${key}=${escape(val)};expires=${exp.toUTCString()}`;
};

/**
 * 读取 cookie 信息
 * @param {string} key - 存储键值
 * @return {any}
 */
export const getCookie = (key: string): any => {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`);
  const arr = document.cookie.match(reg);
  if (arr) {
    return unescape(arr[2]);
  }
  return null;
};

/**
 * 删除指定 cookie 信息
 * @param {string} key - 存储键值
 */
export const delCookie = (key: string): void => {
  const exp = new Date();
  exp.setTime(exp.getTime() - 1);
  const cval = getCookie(key);
  if (cval !== null) {
    document.cookie = `${key}=${cval};expires=${exp.toUTCString()}`;
  }
};

/**
 * 判断图片是否为横图
 * @param {string} url - 图片地址
 * @return {Promise<boolean>}
 */
export const isHorizontalPic = (url: string): Promise<boolean> => {
  const img = new Image();
  img.src = url;
  return new Promise((rs, rj) => {
    // @ts-ignore
    img.onload = ({ path }) => {
      if (path && path[0]) {
        const [obj] = path;
        rs(obj.width >= obj.height);
      } else {
        rj();
      }
    };
  });
};

/**
 * 获取url指定参数
 * @param {string} name - 参数名称
 * @param {string} url - 目标url
 * @return {string|null}
 */
export const getUrlKey = (name: string, url: string): string | null =>
  decodeURIComponent((new RegExp(`[?|&]${name}=([^&;]+?)(&|#|;|$)`).exec(url) || [, ''])[1].replace(/\+/g, '%20')) || null;

/**
 * 深拷贝
 */
export function objDeepCopy(obj: any) {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  const newObj = new obj.constructor();
  const isObject = (target) => (typeof target === 'object' ? (target === obj ? newObj : objDeepCopy(target)) : target);
  if (obj.constructor === Date) return new Date(obj);
  if (obj.constructor === RegExp) return new RegExp(obj);
  if (obj.constructor === Map) {
    const temp = new Map();
    obj.forEach((val, key) => {
      temp.set(isObject(key), isObject(val));
    });
    return temp;
  }
  if (obj.constructor === Set) {
    const temp = new Set();
    obj.forEach((item) => {
      temp.add(isObject(item));
    });
    return temp;
  }
  const keys = [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      newObj[key] = typeof val === 'object' ? objDeepCopy(val) : val;
    }
  }
  return newObj;
}

/**
 * 拷贝文本
 * @param {string} text - 需要复制的文字
 * @return {boolean} - 是否复制成功
 */
export const copy = (text: string): boolean => {
  const textArea = document.createElement('textarea');
  let success = false;
  textArea.value = text;
  textArea.style.cssText = 'position:fixed;pointer-events:none;z-index:-9999;opacity:0;';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error(err);
  }
  document.body.removeChild(textArea);
  return success;
};

/**
 * 根据路径读取对象信息
 * @param {object|[]} value
 * @param {string} str - 路径
 * @return {any}
 */
export const parseValueByPath = (value: object | [], str: string): any => {
  const path = str.split('.');
  return path.length > 1 ? path.reduce((acc, cur: string) => acc[cur] || '', value) : value[str];
};

/**
 * 图片读取失败处理函数
 */
export const picerr = (event): void => {
  const dsrc = '//i.postimg.cc/6pwsQsYc/afef4ca657.jpg';
  if (dsrc && dsrc !== event.target.src) {
    // 防止当默认图片也出错时，有死循环
    let tmpImage = new Image();
    tmpImage.src = dsrc;
    tmpImage.onload = function () {
      tmpImage = null;
      event.target.src = dsrc;
    };
  }
};

/**
 * 响应式对象转普通对象
 * @param {Proxy} value - 响应式对象
 * @return - 普通对象
 */
export const cusToRefs = (value) => {
  const res = toRefs(value);
  const result = {};
  Object.keys(res).forEach((key) => {
    result[key] = res[key].value;
  });
  return result;
};

/**
 * 解析rrweb events，解码文本内容
 * @param events
 * @returns
 */
export const decodeRecordEvents = (events: any[]) => {
  const deepTrans = (node: any) => {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(deepTrans);
    } else if (node.textContent) {
      node.textContent = decodeURIComponent(node.textContent);
    }
  };
  return events.map((e) => {
    const { type, data = {} } = e;
    if (type === 2) {
      const { node } = data;
      deepTrans(node);
    }
    return e;
  });
};

/**
 * 对象转为选项数组
 * @param obj
 * @returns
 */
export const Obj2Options = (obj: IAnyObject) => {
  if (typeof obj !== 'object') {
    return [];
  }
  return Object.keys(obj).map((key) => ({
    label: obj[key],
    value: key
  }));
};
