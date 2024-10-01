
export type voidFun = () => void

export interface IAnyObject {
  [key: string]: any
}

export type UnknownFunc = (...args: unknown[]) => void;