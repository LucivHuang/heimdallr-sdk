import { UnknownFunc } from '@heimdallr-sdk/types';

/**
 * 发布订阅类
 *
 * @export
 * @class Subscribe
 * @template T 事件枚举
 */
export class Subscribe {
  dep: Map<string, UnknownFunc[]> = new Map();
  watch(eventName: string, callBack: (data: any) => any) {
    const fns = this.dep.get(eventName);
    if (fns) {
      this.dep.set(eventName, fns.concat(callBack));
      return;
    }
    this.dep.set(eventName, [callBack]);
  }
  notify<D = any>(eventName: string, data: D) {
    const fns = this.dep.get(eventName);
    if (!eventName || !fns) return;
    fns.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error(err);
      }
    });
  }
}
