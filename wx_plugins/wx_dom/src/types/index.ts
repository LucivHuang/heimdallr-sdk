import { IAnyObject, ReportDataMsgType } from "@heimdallr-sdk/types";

export interface WxDomDataType {
  m: string;
  /** type */
  dt: string;
  /** detail */
  det?: IAnyObject;
  /** currentTarget */
  ct?: IAnyObject;
}

export interface WxDomMsgType extends ReportDataMsgType, WxDomDataType {}
