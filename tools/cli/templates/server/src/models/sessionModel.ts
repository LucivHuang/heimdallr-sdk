import { PrismaClient } from '@prisma/client';
import { ConditionType, ModelResponseType, Session } from '../types';

class SessionModel {
  prisma: any;
  constructor() {
    this.prisma = new PrismaClient({});
  }
  async add(datas: Session[]): Promise<ModelResponseType<Session>> {
    try {
      const result = await this.prisma.session.createMany({
        data: datas
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
  async modify(query, data: Session): Promise<ModelResponseType<Session>> {
    try {
      const result = await this.prisma.session.update({
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
      const result = await this.prisma.session.count({
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
  async find(pindex: number = 1, psize: number = 1, query = {}, order?): Promise<ModelResponseType<Session[]>> {
    try {
      const condition: ConditionType = { where: query };
      const skip = (pindex - 1) * Number(psize);
      if (skip) {
        condition.skip = skip;
        condition.take = Number(psize);
      }
      if (order) {
        condition.orderBy = [order];
      }
      const result = await this.prisma.session.findMany(condition);
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

export default SessionModel;
