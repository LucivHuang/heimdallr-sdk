export enum StoreKeyType {
  SESSION_ID = 'HEIMDALLR_SDK_SESSION_ID',
  USER_ID = 'HEIMDALLR_SDK_USER_ID',
  APP = 'HEIMDALLR_SDK_APP_ID',
}

export enum MethodTypes {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum EventTypes {
  LIFECYCLE = 1,
  ERROR,
  PERFORMANCE,
  API,
  DOM,
  ROUTE,
  CONSOLE,
  RECORD,
  VUE,
  CUSTOMER,
  EXTEND,
}

export enum BrowserErrorTypes {
  CODEERROR = 21,
  RESOURCEERROR,
  UNHANDLEDREJECTION,
  PAGECRASH
}

export enum BrowserReportType {
  BEACON = 1,
  IMG,
  GET,
  POST
}

export enum DomTypes {
  CLICK = 51
}

export enum ConsoleTypes {
  LOG = 'log',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  ASSERT = 'assert'
}

export enum HttpTypes {
  XHR = 41,
  FETCH,
}

export enum PerTypes {
  FMP = 31,
  FPS,
  BASIC,
  VITALS,
  RESOURCE
}

export enum RouteTypes {
  HASH = 61,
  HISTORY
}

export enum CustomerTypes {
  CUSTOMER = 111
}

export type BrowserSubTypes = PageLifeType | BrowserErrorTypes | DomTypes | HttpTypes | ConsoleTypes | PerTypes | RouteTypes | CustomerTypes;

export type StoreTypes = 'local' | 'session' | 'cookie' | 'global';

export enum StoreType {
  LOCAL = 'local',
  SESSION = 'session',
  COOKIE = 'cookie',
  GLOBAL = 'global'
}

export enum PageLifeType {
  LOAD = 11,
  UNLOAD
}

export enum DeviceType {
  MOBILE = 1,
  PC
}

export enum PlatformTypes {
  BROWSER = 1,
  WECHAT,
  NODE,
}

export enum BrowserBreadcrumbTypes {
  ROUTE = 11,
  CLICK,
  CONSOLE,
  XHR,
  FETCH,
  UNHANDLEDREJECTION,
  RESOURCE,
  CODE_ERROR,
  CUSTOMER,
  FRAMEWORK,
  LIFECYCLE,
  CRASH
}

export enum WxBreadcrumbTypes {
  API = 21,
  ROUTE,
  CLICK,
  ERROR,
  LIFECYCLE,
  CUSTOMER
}
