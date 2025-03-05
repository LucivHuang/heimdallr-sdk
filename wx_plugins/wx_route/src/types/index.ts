import { ReportDataMsgType } from "@heimdallr-sdk/types";

export enum WxRouteEvents {
  SWITCH_TAB = 'switchTab',
  RELAUNCH = 'reLaunch',
  REDIRECT_TO = 'redirectTo',
  NAVIGATE_TO = 'navigateTo',
  NAVIGATE_BACK = 'navigateBack',
  NAVIGATE_TO_MINI_PROGRAM = 'navigateToMiniProgram',
  NAVIGATE_BACK_MINI_PROGRAM = 'navigateBackMiniProgram',
  OPEN_EMBEDDED_MINI_PROGRAM = 'openEmbeddedMiniProgram',
  OPEN_PROFILE = 'openOfficialAccountProfile',
  OPEN_ARTICLE = 'openOfficialAccountArticle',
  ROUTE_FAIL = 'routeFail'
}

export interface WxRouteDataType {
  from: string;
  to: string;
  wt: WxRouteEvents | string;
  fail?: boolean;
  msg?: string;
}

export interface WxRouteMsgType extends ReportDataMsgType, WxRouteDataType {}
