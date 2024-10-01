import { BtnType, ComponentSize } from "helper/types";
export declare interface OperateBtn {
  cmd: string;
  label?: string;
  type?: BtnType;
  round?: boolean;
  plain?: boolean;
  class?: string | { [key: string]: string };
  style?: string | {};
  icon?: string;
  size?: ComponentSize;
  position?: string;
}
