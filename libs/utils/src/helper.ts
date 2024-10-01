import { IAnyObject } from '@heimdallr-sdk/types';

/**
 * 生成UUID v4
 * @return {string} 生成的UUID字符串
 */
export const generateUUID = () => {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 函数节流
 *
 * @export
 * @param {Function} fn 需要节流的函数
 * @param {number} delay 节流的时间间隔（毫秒）
 * @return {(...args: any[]) => void} 返回一个包含节流功能的函数
 */
export const throttle = <T extends (...args: any[]) => void>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
};

/**
 * 重写对象上面的某个属性
 *
 * @export
 * @param {IAnyObject} source 需要被重写的对象
 * @param {string} name 需要被重写对象的key
 * @param {(...args: any[]) => any} replacement 以原有的函数作为参数，执行并重写原有函数
 * @param {boolean} isForced 是否强制重写（可能原先没有该属性）
 */
export const replaceOld = (source: IAnyObject, name: string, replacement: (...args: any[]) => any, isForced?: boolean) => {
  if (source === undefined) return;
  if (name in source || isForced) {
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === 'function') {
      source[name] = wrapped;
    }
  }
};

/**
 * 保留指定位数的小数
 * @param num 原数据
 * @param decimal 小数位数
 * @returns {number} 格式化后的数字，或原始输入
 */
 export const formatDecimal = (num: number, decimal: number) => {
  if (!isFinite(num) || isNaN(num)) {
    return num; // 对于 NaN 和 Infinity 直接返回原始数值
  }

  if (!Number.isInteger(decimal) || decimal < 0) {
    return num; // 如果小数位数无效，返回原始数值
  }

  return parseFloat(num.toFixed(decimal));
}


/**
 * 计算字符串大小
 * @param str
 * @returns 字节
 */
export const countBytes = (str: string) => {
  const encoder = new TextEncoder();
  return encoder.encode(str).length;
};

/**
 * 根据字节大小拆分字符串
 * @param str
 * @param maxBytes 最大字节数
 * @returns
 */
export const splitStringByBytes = (str: string, maxBytes: number): Array<string> => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const decoder = new TextDecoder();
  const chunks = [];
  let start = 0;
  while (start < bytes.length) {
    let end = start + maxBytes;
    while (end > start && (bytes[end] & 0xc0) === 0x80) {
      end--;
    }
    chunks.push(decoder.decode(bytes.subarray(start, end)));
    start = end;
  }
  return chunks;
};
