export interface InterfaceResponseType<T> {
  code: number;
  msg: string;
  data?: T;
}
