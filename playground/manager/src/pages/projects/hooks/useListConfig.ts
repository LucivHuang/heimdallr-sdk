import { FilterItem } from "components/filterGroup";
import { OperateBtn } from "components/tableOprate";
import { ColumnConfig } from "components/tableView";

const filterFormItems: FilterItem[] = [
  {
    renderType: "input",
    label: "ID",
    prop: "id",
  },
  {
    renderType: "input",
    label: "名称",
    prop: "name",
  },
  {
    renderType: "input",
    label: "负责人",
    prop: "leader",
  }
];



const tableOprates: OperateBtn[] = [
  {
    cmd: "copy",
    label: "批量复制ID",
    position: "left",
    plain: true,
    icon: "DocumentCopy",
  },
];

const tableConfig: ColumnConfig[] = [
  {
    prop: "id",
    label: "项目ID",
    width: 320,
    plugins: ["copy"],
  },
  {
    prop: "name",
    label: "项目名称",
    plugins: ["copy"],
  },
  {
    prop: "leader",
    label: "负责人",
  },
  {
    prop: "desc",
    label: "描述",
  },
  {
    prop: "ctime",
    width: 158,
    label: "创建时间",
    sortable: true,
    config: {
      sortParam: "sort",
      orderParam: "order",
      sortVal: "ctime",
      ascVal: "asc",
      descVal: "desc",
    },
  }
];

export default function useListConfig() {
  return {
    dataPath: "list",
    tableOprates,
    filterFormItems,
    tableConfig,
  };
}
