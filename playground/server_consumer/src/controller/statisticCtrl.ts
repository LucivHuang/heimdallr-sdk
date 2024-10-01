import { failResponse, successResponse } from '../lib/utils';
import LogModel from '../models/logModel';
import { IAnyObject } from '../types';

const logModel = new LogModel();

interface lgt {
  lt?: number | Date;
  gt?: number | Date;
}

interface WhereConditionType {
  type?: string;
  sub_type?: number;
  ascription_id?: string;
  OR?: WhereConditionType[];
  otime?: lgt;
}

interface ProjResultType {
  eapi: IAnyObject;
  api: IAnyObject;
  err: IAnyObject;
  fmp: IAnyObject;
}
interface TotalResultType {
  eapi: number;
  api: number;
  err: number;
  fmp: number;
}

enum StatisticMod {
  MON = 'month',
  WEEK = 'week',
  TDAY = 'today',
  YDAY = 'yesterday'
}

async function projGet(projId: string, start: Date, end?: Date): Promise<ProjResultType> {
  const errWhere: WhereConditionType = {
    ascription_id: projId,
    OR: [
      {
        type: '2'
      },
      {
        sub_type: 91
      }
    ]
  };
  const perWhere: WhereConditionType = {
    ascription_id: projId,
    type: 'performance',
    sub_type: 31
  };
  const apiWhere: WhereConditionType = {
    ascription_id: projId,
    type: '4'
  };
  if (start) {
    errWhere.otime = {
      gt: start
    };
    perWhere.otime = {
      gt: start
    };
    apiWhere.otime = {
      gt: start
    };
  }
  if (end) {
    errWhere.otime.lt = end;
    perWhere.otime.lt = end;
    apiWhere.otime.lt = end;
  }
  try {
    const [{ data: errList }, { data: fmpList }, { data: apiList }] = await Promise.all([
      logModel.find(0, 0, errWhere),
      logModel.find(0, 0, perWhere),
      logModel.find(0, 0, apiWhere)
    ]);
    const errCount = errList?.reduce((total, err) => {
      const otime = new Date(err.otime);
      const month = otime.getMonth() + 1;
      const day = otime.getDate();
      const curDate = `${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
      total[curDate] = total[curDate] ? total[curDate] + 1 : 1;
      return total;
    }, {});
    const fmpCount = fmpList?.reduce((total, fmp) => {
      if (!fmp || !fmp.data) {
        return total;
      }
      try {
        const otime = new Date(fmp.otime);
        const month = otime.getMonth() + 1;
        const day = otime.getDate();
        const curDate = `${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
        const obj = JSON.parse(fmp.data);
        if (obj.value > 1000) {
          // 大于1秒
          total[curDate] = total[curDate] ? total[curDate] + 1 : 1;
        }
      } catch (error) {
        console.error('[@heimdallr-sdk/server](statisticCtrl/projGet):', error);
      }
      return total;
    }, {});
    const eapiCount = {};
    const apiCount = apiList?.reduce((total, api) => {
      if (!api || !api.data) {
        return total;
      }
      try {
        const otime = new Date(api.otime);
        const month = otime.getMonth() + 1;
        const day = otime.getDate();
        const curDate = `${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
        const obj = JSON.parse(api.data);
        if (obj.elapsedTime > 1000) {
          // 大于1秒
          total[curDate] = total[curDate] ? total[curDate] + 1 : 1;
        }
        if ((obj.response || {}).status !== 200) {
          // 接口异常
          eapiCount[curDate] = eapiCount[curDate] ? eapiCount[curDate] + 1 : 1;
        }
      } catch (error) {
        console.error('[@heimdallr-sdk/server](statisticCtrl/projGet):', error);
      }
      return total;
    }, {});
    return {
      eapi: eapiCount,
      api: apiCount,
      err: errCount,
      fmp: fmpCount
    };
  } catch (error) {
    console.error('[server/statisticCtrl]: ', error);
    return {
      eapi: {},
      api: {},
      err: {},
      fmp: {}
    };
  }
}

async function totalGet(start?: Date, end?: Date): Promise<TotalResultType> {
  const errWhere: WhereConditionType = {
    otime: {},
    OR: [
      {
        type: '2'
      },
      {
        sub_type: 91
      }
    ]
  };
  const perWhere: WhereConditionType = {
    otime: {},
    type: '3',
    sub_type: 31
  };
  const apiWhere: WhereConditionType = {
    otime: {},
    type: '4'
  };
  if (start) {
    errWhere.otime.gt = start;
    perWhere.otime.gt = start;
    apiWhere.otime.gt = start;
  }
  if (end) {
    errWhere.otime.lt = end;
    perWhere.otime.lt = end;
    apiWhere.otime.lt = end;
  }
  try {
    const [{ data: errCount }, { data: fmpList }, { data: apiList }] = await Promise.all([
      logModel.count(errWhere),
      logModel.find(0, 0, perWhere),
      logModel.find(0, 0, apiWhere)
    ]);
    const fmpCount = fmpList?.reduce((total, fmp) => {
      if (fmp && fmp.data) {
        const obj = JSON.parse(fmp.data);
        // 大于1秒
        if (obj.value > 1000) {
          total += 1;
        }
      }
      return total;
    }, 0);
    let eapiCount = 0;
    const apiCount = apiList?.reduce((total, api) => {
      if (api && api.data) {
        const obj = JSON.parse(api.data);
        if (obj.elapsedTime >= 1000) {
          // 大于1秒
          total += 1;
        }
        if ((obj.response || {}).status !== 200) {
          // 接口异常
          eapiCount++;
        }
      }
      return total;
    }, 0);
    return {
      eapi: eapiCount,
      api: apiCount,
      err: errCount,
      fmp: fmpCount
    };
  } catch (error) {
    console.error('[server/statisticCtrl]: ', error);
    return {
      eapi: -1,
      api: -1,
      err: -1,
      fmp: -1
    };
  }
}

/**
 * 获取总览数据
 * @param req
 * @param res
 */
export async function statisticTotalGet(req, res) {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const lastday = new Date(now.getTime() - 24 * 3600 * 1000);

    const beforeRes = await totalGet(null, lastday);
    const lastRes = await totalGet(lastday, now);
    const todayRes = await totalGet(now);

    const result = ['eapi', 'api', 'err', 'fmp'].reduce((pre, cur) => {
      pre[cur] = beforeRes[cur] + lastRes[cur] + todayRes[cur];
      pre[`${cur}Inc`] = todayRes[cur] - lastRes[cur];
      return pre;
    }, {});
    res.send(successResponse(result, 'success'));
  } catch (err) {
    res.send(failResponse(err.message || JSON.stringify(err)));
  }
}

/**
 * 获取应用数据
 * @param req
 * @param res
 */
export async function statisticProjGet(req, res) {
  try {
    const { proj_id, mod } = req.query;
    if (!proj_id || !mod) {
      res.send(failResponse('missing proj_id or mod'));
      return;
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let start = null;
    let end = null;
    switch (mod) {
      case StatisticMod.MON:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case StatisticMod.WEEK:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case StatisticMod.YDAY:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        end = now;
        break;
      case StatisticMod.TDAY:
        start = now;
        break;
      default:
        res.send(failResponse('unknown mod'));
        return;
    }
    const resultList = await projGet(proj_id, start, end);
    res.send(successResponse(resultList, 'success'));
  } catch (err) {
    res.send(failResponse(err.message || JSON.stringify(err)));
  }
}
