import { ReportDataMsgType } from "@heimdallr-sdk/types";

export interface DomDataMsgType {
  ele: string;
  x: number;
  y: number;
}

export interface DomMsgType extends ReportDataMsgType, DomDataMsgType {}

export interface DomOptions {
  throttleDelayTime?: number;
}