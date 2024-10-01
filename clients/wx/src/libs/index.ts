import { TAG } from '@heimdallr-sdk/types';

export function setStorageSync(key: string, data: any) {
  if (!key || !data) {
    return;
  }
  try {
    wx.setStorageSync(key, data);
  } catch (error) {
    console.error(TAG, `Store ${key} faild`, error);
  }
}

export function getStorageSync(key: string): any {
  if (!key) {
    return null;
  }
  try {
    return wx.getStorageSync(key);
  } catch (error) {
    console.error(TAG, `Get ${key} faild`, error);
    return null;
  }
}
