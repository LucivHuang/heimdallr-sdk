import { BaseOptionsType, BreadcrumbLevel, BreadcrumbPushData } from '@heimdallr-sdk/types';
/**
 * 用户行为栈存储类
 * @export
 * @class Breadcrumb
 * @template O
 */
export class Breadcrumb<O extends BaseOptionsType> {
  private readonly maxBreadcrumbs: number;
  private stack: BreadcrumbPushData[];
  constructor(options: Partial<O> = {}) {
    this.maxBreadcrumbs = options.maxBreadcrumbs || 80;
    this.stack = [];
  }
  /**
   * 添加用户行为栈
   * @param {BreadcrumbPushData} data
   */
  unshift(data: BreadcrumbPushData): BreadcrumbPushData[] {
    if (!data.l) {
      data.l = BreadcrumbLevel.INFO;
    }
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.pop();
    }
    this.stack.unshift(data);
    this.stack.sort((a, b) => b.t - a.t);
    return this.stack;
  }

  private pop(): boolean {
    return this.stack.pop() !== undefined;
  }

  clear(): void {
    this.stack = [];
  }

  getStack(): BreadcrumbPushData[] {
    return this.stack.slice(0);
  }
}
