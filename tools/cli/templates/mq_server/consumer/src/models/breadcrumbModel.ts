import { PrismaClient } from '@prisma/client';
import { ModelResponseType, BreadCrumbRes } from '../types';

class BreadCrumbModel {
  prisma: any;
  constructor() {
    this.prisma = new PrismaClient({});
  }
  async add(datas: BreadCrumbRes[]): Promise<ModelResponseType<BreadCrumbRes>> {
    try {
      const result = await this.prisma.breadCrumb.createMany({
        data: datas,
        skipDuplicates: true // 插入重复数据时，不会报错
      });
      if (result) {
        return {
          status: true,
          msg: 'success'
        };
      }
      throw new Error(JSON.stringify(result));
    } catch (error) {
      return {
        status: false,
        msg: error.message || error
      };
    }
  }
  async find(query = {}): Promise<ModelResponseType<BreadCrumbRes[]>> {
    try {
      const result = await this.prisma.breadCrumb.findMany({
        where: query,
        orderBy: {
          time: 'desc'
        }
      });
      return {
        status: true,
        data: result,
        msg: 'success'
      };
    } catch (error) {
      return {
        status: false,
        data: [],
        msg: error.message || error
      };
    }
  }
}

export default BreadCrumbModel;
