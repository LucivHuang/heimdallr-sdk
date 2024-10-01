import { logType, platform } from '@/helper/config/filters';
import { Obj2Options } from '@/helper/utils';
import { FilterItem } from 'components/filterGroup';
import { OperateBtn } from 'components/tableOprate';
import { ColumnConfig } from 'components/tableView';

const filterFormItems: FilterItem[] = [
  {
    renderType: 'smartbox',
    label: '应用',
    prop: 'ascription_id',
    config: {
      url: '/project/list?psize=20&pindex=1',
      targetPath: 'list',
      nameKey: 'name',
      searchKey: 'name',
      idKey: 'id'
    }
  },
  {
    renderType: 'input',
    label: '日志ID',
    prop: 'id'
  },
  {
    prop: 'platform',
    label: '平台',
    renderType: 'select',
    options: Obj2Options(platform)
  },
  {
    prop: 'type',
    label: '类型',
    renderType: 'select',
    options: Obj2Options(logType)
  }
];

const tableOprates: OperateBtn[] = [
  {
    cmd: 'copy',
    label: '批量复制ID',
    position: 'left',
    plain: true,
    icon: 'DocumentCopy'
  }
];

const tableConfig: ColumnConfig[] = [
  {
    prop: 'id',
    label: 'ID',
    plugins: ['copy']
  },
  {
    prop: 'platform',
    width: 108,
    label: '平台'
  },
  {
    prop: 'type',
    width: 108,
    label: '类型'
  },
  {
    prop: 'subType',
    width: 158,
    label: '子类型'
  },
  {
    prop: 'ascription',
    label: '项目'
  },
  {
    prop: 'sessionId',
    label: '会话ID',
    plugins: ['copy']
  },
  {
    prop: 'otime',
    width: 160,
    label: '发生时间',
    sortable: true,
    config: {
      sortParam: 'sort',
      orderParam: 'order',
      sortVal: 'otime',
      ascVal: 'asc',
      descVal: 'desc'
    }
  },
  {
    type: 'operation',
    label: '操作',
    operates: [
      {
        cmd: 'detail',
        label: '详情'
      }
    ]
  }
];

export default function useListConfig() {
  return {
    dataPath: 'list',
    tableOprates,
    filterFormItems,
    tableConfig
  };
}
