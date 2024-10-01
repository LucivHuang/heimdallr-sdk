import { setUrlQuery } from '@heimdallr-sdk/utils';
import { IAnyObject } from '@heimdallr-sdk/types';

export interface PageRoute {
  route: string;
  options: IAnyObject;
}

export function getPageRoute(): PageRoute[] {
  if (typeof getCurrentPages !== 'function') {
    return [];
  }
  const pages = getCurrentPages(); // 在App里调用该方法，页面还没有生成，长度为0
  if (!pages.length) {
    return [{ route: 'App', options: {} }];
  }
  return pages;
}

export function getCurrentRoute(): string {
  const pages = getPageRoute();
  if (!pages.length) {
    return '';
  }
  const currentPage = pages.pop();
  return setUrlQuery(currentPage.route, currentPage.options);
}

/**
 * 后退时需要计算当前页面地址
 * @param delta 返回的页面数，如果 delta 大于现有页面数，则返回到首页
 */
export function getNavigateBackTargetUrl(delta = 1): string {
  const pages = getPageRoute();
  if (!pages.length) {
    return '';
  }
  const toPage = pages[pages.length - delta];
  return setUrlQuery(toPage.route, toPage.options);
}
