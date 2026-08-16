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
