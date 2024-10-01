export interface InterfaceResponseType<T> {
  code: number;
  msg: string;
  data?: T;
}

export interface IAnyObject {
  [key: string]: any;
}

export interface IPInfo {
  ip: string;
  error?: string;
  region?: string;
}
