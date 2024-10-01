type ColumnType = 'slot' | 'operation';
type ColumnPlugin = 'copy' | 'edit' | 'translate' | 'filter';

declare interface TranslateConfig {
  url: string;
  dataPath: string;
  dataKey: string;
}

export type ConditionCmdType = 'notempty' | 'empty';

export declare interface BtnCondition {
  prop: string;
  values?: Array<string | number>;
  cmd?: ConditionCmdType
}

export declare interface OperateBtn {
  cmd: string;
  label: string;
  type?: string;
  class?: string;
  size?: string;
  condition?: BtnCondition;
}

// sort
export declare interface InnerConfig {
  orderParam?: string;
  ascVal?: string | number;
  descVal?: string | number;
  sortParam?: string;
  sortVal?: string | number;
}

// translate
export declare interface InnerConfig {
  translate?: TranslateConfig;
}

export declare interface ColumnConfig {
  label: string;
  prop?: string;
  type?: string;
  width?: number;
  align?: string;
  cusClass?: string;
  style?: string;
  minWidth?: string;
  sortable?: boolean; // 是否支持排序
  headerSlot?: boolean; // 使用插槽自定义表头
  operates?: Array<OperateBtn>; // 操作栏按钮
  config?: InnerConfig;
  plugins?: Array<string>;
}
