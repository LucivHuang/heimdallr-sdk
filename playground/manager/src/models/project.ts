import { deserializeArr, mapperProperty } from 'type-json-mapper';

// 未声明的属性字段将不会被添加

export class Project {
  @mapperProperty('id')
  public id: string;
  @mapperProperty('name')
  public name: string;
  @mapperProperty('leader')
  public leader: string;
  @mapperProperty('desc')
  public desc: string;
  @mapperProperty('ctime', 'datetime')
  public ctime: string;
}

export const tableDeserialize = (tableData: Project[]) => deserializeArr(Project, tableData);
