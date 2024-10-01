import fetch from 'node-fetch';
import { Core } from '@heimdallr-sdk/core';
import {
  IAnyObject,
  InterfaceResponseType,
  ConsoleTypes,
  PlatformTypes
} from '@heimdallr-sdk/types';
import { generateUUID, obj2query } from '@heimdallr-sdk/utils';
// 基础插件
import errorPlugin from './plugins/uncaughtException';
import { NodeOptionsType, NodeReportPayloadDataType } from './types';

class NodeClient extends Core<NodeOptionsType> {
  constructor(options: NodeOptionsType) {
    super(options);
  }

  async initAPP() {
    const { initUrl, app } = this.getContext();
    const ctime = Date.now();
    const params = {
      id: generateUUID(),
      ...app,
      ctime
    };
    const { data } = await this.report(initUrl, params);
    const { id = '' } = data || {};
    return id;
  }

  isRightEnv() {
    return typeof process !== 'undefined';
  }

  async report(url: string, data: IAnyObject): Promise<InterfaceResponseType<any>> {
    const { sendFunc } = this.getClientOptions();
    try {
      if (typeof sendFunc === 'function') {
        return await sendFunc(url, data);
      }
      // default get
      const res = await fetch(`${url}?${obj2query(data)}`);
      return (await res.json()  as InterfaceResponseType<any>);
    } catch (error) {
      console.log(error, ConsoleTypes.ERROR);
      return {
        code: -1,
        msg: error.message || '未知错误'
      };
    }
  }

  transform(datas: IAnyObject): NodeReportPayloadDataType {
    if (!datas) {
      return null;
    }
    return {
      p: PlatformTypes.NODE,
      ...datas
    };
  }

  nextTick(cb: Function, ctx: Object, ...args: any[]) {
    process.nextTick(() => {
      cb.call(ctx, ...args);
    });
  }
}

const init = (options: NodeOptionsType) => {
  const client = new NodeClient(options);
  const { plugins = [] } = options;
  client.use([errorPlugin(), ...plugins]);
};

export default init;
