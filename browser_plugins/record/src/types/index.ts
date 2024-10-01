import { ReportDataMsgType } from "@heimdallr-sdk/types";

export enum RecordTypes {
  SESSION = 81
}

export interface RecordDataType {
  evs: any[] | string;
}

export interface RecordMsgType extends ReportDataMsgType, RecordDataType {}
