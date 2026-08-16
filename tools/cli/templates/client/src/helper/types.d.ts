export declare type ComponentSize = "small" | "large" | "default";
export declare type BtnType =
  | "default"
  | "text"
  | "warning"
  | "primary"
  | "danger"
  | "success"
  | "info";
export declare type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";
export declare interface Option {
  value: string | number;
  label: string;
}
export interface IAnyObject {
  [key: string]: any;
}