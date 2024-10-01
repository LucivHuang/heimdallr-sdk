import { getPortPromise } from 'portfinder';
import { InterfaceResponseType, IAnyObject } from '../types';

export function successResponse(data: any, msg: string): InterfaceResponseType<IAnyObject> {
  return {
    code: 0,
    data,
    msg
  };
}

export function failResponse(msg: string): InterfaceResponseType<IAnyObject> {
  return {
    code: -1,
    msg
  };
}

/**
 * 是否是移动端设备
 * @param userAgentStr 
 * @returns 
 */
export function isMobileDevice(userAgentStr: string): Boolean {
  const appTypeList = ['iphone', 'android', 'ipad', 'mobi'];
  const userAgent = userAgentStr.toLocaleLowerCase();
  let isMobile = false;
  for (const type of appTypeList) {
    if (userAgent.indexOf(type) > -1) {
      isMobile = true;
      break;
    }
  }
  return isMobile;
}

/**
 * 生成UUID
 * @return {string}  {string}
 */
export function generateUUID(): string {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

/**
 * 查找可用端口
 * @return {number}
 */
export async function getUseablePort(options = {}): Promise<number> {
  const localOptions = {
    startPort: 7000,
    stopPort: 9000
  };
  try {
    return await getPortPromise({ ...localOptions, ...options });
  } catch (error) {
    return 0;
  }
}
