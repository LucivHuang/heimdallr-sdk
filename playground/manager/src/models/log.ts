import { logType, platform, subType } from '@/helper/config/filters';
import { deepMapperProperty, deserialize, deserializeArr, filterMapperProperty, mapperProperty } from 'type-json-mapper';

// 未声明的属性字段将不会被添加

export class Log {
  @mapperProperty('id')
  public id: string;
  @filterMapperProperty('platform', (val: number) => platform[val])
  public platform: string;
  @filterMapperProperty('type', (val: number) => logType[val])
  public type: string;
  @filterMapperProperty('sub_type', (val: number) => subType[val])
  public subType: string;
  @mapperProperty('ascription')
  public ascription: string;
  @mapperProperty('session_id')
  public sessionId: string;
  @mapperProperty('otime', 'datetime')
  public otime: string;
}

export class Breadcrumb {
  @mapperProperty('time', 'datetime')
  public time: string;
  @mapperProperty('level')
  public level: string;
  @mapperProperty('type')
  public type: string;
  @mapperProperty('message')
  public message: string;
}

export class LogDetail {
  @mapperProperty('path')
  public path: string;
  @mapperProperty('type')
  public type: string;
  @mapperProperty('sub_type', 'int')
  public subType: number;
  @mapperProperty('ascription_name')
  public ascription: string;
  @mapperProperty('otime', 'datetime')
  public otime: string;
  @mapperProperty('data')
  public data: string;
}

export const tableDeserialize = (tableData: Log[]) => deserializeArr(Log, tableData);

export const detailDeserialize = (detail: LogDetail) => deserialize<LogDetail>(LogDetail, detail);
