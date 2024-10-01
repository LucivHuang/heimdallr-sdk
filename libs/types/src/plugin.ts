import { ReportDataType } from "./base";
export interface BasePluginType {
  name: string;
  /** 监控事件 */
  monitor: (notify: (data: any) => void) => void;
  /** 数据格式转换 */
  transform?: (collectedData: any) => ReportDataType<any>;
  [key: string]: any
}
