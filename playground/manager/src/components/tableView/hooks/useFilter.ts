import { ColumnConfig, OperateBtn } from '../index';

declare interface FilterResult {
  color: string;
  text: string;
}

export default function useFilter(props, enableBtn: Function, hasPlugins: Function) {
  // 操作按钮颜色
  function operateBtnStyleFilter(btn: OperateBtn, row) {
    const { type, condition = {} } = btn;
    if (!enableBtn(condition, row)) {
      return '';
    }
    switch (type) {
      case 'info':
        return 'color:#909399';
      case 'primary':
        return 'color:#409EFF';
      case 'success':
        return 'color:#67C23A';
      case 'warning':
        return 'color:#E6A23C';
      case 'danger':
        return 'color:#F56C6C';
      default:
        break;
    }
  }
  // 样式
  function styleFilter(column: ColumnConfig, row) {
    const { style } = column;
    if (['[object String]', '[object Object]'].includes(Object.prototype.toString.call(style))) {
      return style;
    }
    if (hasPlugins(column, 'filter')) {
      const result = filterHandle(column, row);
      return {
        color: typeof result === 'string' ? '' : result.color
      };
    }
  }
  // 文本
  function textFilter(column: ColumnConfig, row) {
    const { prop } = column;
    if (hasPlugins(column, 'filter')) {
      const result = filterHandle(column, row);
      return typeof result === 'string' ? result : result.text;
    }
    return row[prop];
  }

  // 静态翻译
  function filterHandle(column: ColumnConfig, row): FilterResult {
    const { prop } = column;
    const value = row[prop];
    const defaultTrans = {
      color: '',
      text: value || '-'
    };
    const temp = props.filterMap[prop];
    if (temp && temp[value]) {
      return (
        temp[value].text || {
          text: temp[value],
          color: ''
        }
      );
    }
    return defaultTrans;
  }
  return {
    operateBtnStyleFilter,
    styleFilter,
    textFilter
  };
}
