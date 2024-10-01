import { BreadcrumbPushData, ClientInfoType, LinkMsgDataType, ReportDataMsgType } from "@heimdallr-sdk/types";

export interface CrashErrorType extends ReportDataMsgType, LinkMsgDataType {
  sendUrl: string;
  stack: BreadcrumbPushData[];
  clientInfo: ClientInfoType;
}
