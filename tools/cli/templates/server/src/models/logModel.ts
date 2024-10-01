import { PrismaClient } from '@prisma/client';
import { IAnyObject, LogItem, ModelResponseType } from '../types';

interface LogCodition {
  where?: IAnyObject;
  orderBy?: any[];
  skip?: number;
  take?: number;
}

class LogModel {
  prisma: any;
  constructor() {
    this.prisma = new PrismaClient({});
  }
  async add(datas: LogItem[]): Promise<ModelResponseType<LogItem>> {
    try {
      const result = await this.prisma.log.createMany({
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
  async modify(query, data: LogItem): Promise<ModelResponseType<LogItem>> {
    try {
      const result = await this.prisma.log.update({
        where: query,
        data
      });
      return {
        status: true,
        data: result,
        msg: 'success'
      };
    } catch (error) {
      return {
        status: false,
        msg: error.message || error
      };
    }
  }
  async count(query = {}): Promise<ModelResponseType<number>> {
    try {
      const result = await this.prisma.log.count({
        where: query
      });
      return {
        status: true,
        data: result,
        msg: 'success'
      };
    } catch (error) {
      return {
        status: false,
        msg: error.message || error
      };
    }
  }
  async find(pindex: number = 1, psize: number = 1, query = {}, order?): Promise<ModelResponseType<LogItem[]>> {
    try {
      const skip = (pindex - 1) * Number(psize);
      let orderBy: any[] = [];
      if (order) {
        orderBy.push(order);
      }
      const condition: LogCodition = {
        where: query,
        orderBy
      };
      if (pindex && psize) {
        condition.skip = skip;
        condition.take = Number(psize);
      }
      const result = await this.prisma.log.findMany(condition);
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

export default LogModel;
