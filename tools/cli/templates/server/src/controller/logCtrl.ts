import { failResponse, generateUUID, isMobileDevice, successResponse } from '../lib/utils';
import ProjModel from '../models/projModel';
import LogModel from '../models/logModel';
import BreadCrumbModel from '../models/breadcrumbModel';
import { BreadCrumb, IPInfo, LogItem, DeviceType, EventTypes, PageLifeType, RecordTypes } from '../types';
import SessionModel from '../models/sessionModel';

const TAG = '[logCtrl]:';

const projModel = new ProjModel();
const logModel = new LogModel();
const bcModel = new BreadCrumbModel();
const sessionModel = new SessionModel();

/**
 * post上报
 * @param req
 * @param res
 */
export function uploadPost(req, res) {
  const param = (req as any).fields;
  const { ipInfo } = req;
  uploadCtrl(res, param, ipInfo);
}
/**
 * get上报
 * @param req
 * @param res
 */
export function uploadGet(req, res) {
  const param = (req as any).query;
  const { ipInfo } = req;
  uploadCtrl(res, param, ipInfo);
}

/**
 * 上报主逻辑
 * @param res
 * @param param 请求参数
 */
async function uploadCtrl(res, param, ipInfo: IPInfo) {
  const {
    aid,
    sid,
    lid,
    uid,
    t,
    e,
    dat: paramData = '{}',
    p,
    b: breadcrumbJson = '[]',
    url = '',
    lan = '',
    ua = '',
    ttl = '',
    ws = '',
    ds = ''
  } = param;
  if (!lid || !aid) {
    res.send(failResponse('missing lid or aid'));
    return;
  }
  // 兼容不同上报方式
  const logType = `${e}`;
  const platform = `${p}`;

  const otime = new Date(+t);
  try {
    // 将入参转为数据库存储结构
    const paramObj = JSON.parse(paramData.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
    const { st, acc = '', evs = [] } = paramObj;
    // ip获取
    const { error, ip, region = '' } = ipInfo;
    if (error) {
      console.error(TAG, error);
    }
    // session
    const newSession = {
      id: sid,
      user_id: `${uid}`,
      account: `${acc}`,
      ip,
      province: region,
      path: url,
      page_title: ttl,
      platform,
      stay_time: 0,
      terminal: `${isMobileDevice(ua) ? DeviceType.MOBILE : DeviceType.PC}`,
      language: lan,
      events: '',
      breadcrumb: '',
      user_agent: ua,
      window_size: ws,
      document_size: ds,
      etime: otime,
      ltime: otime
    };
    delete paramObj.st;
    const { data = [] } = await sessionModel.find(1, 5, {
      id: sid
    });
    const [targetSession] = data;
    if (!targetSession) {
      // session 不存在，新建
      const addSessionRes = await sessionModel.add([newSession]);
      if (!addSessionRes.status) {
        res.send(failResponse(addSessionRes.msg));
        return;
      }
    }
    if ([`${EventTypes.LIFECYCLE}`, `${EventTypes.RECORD}`].includes(logType)) {
      let response = { status: false, msg: 'success' };
      switch (parseInt(st)) {
        case PageLifeType.LOAD:
          if (targetSession) {
            // 已存在，更新一下
            response = await sessionModel.modify(
              { id: sid },
              {
                page_title: ttl,
                language: lan,
                user_agent: ua,
                window_size: ws,
                document_size: ds
              }
            );
          } else {
            response.status = true;
          }
          break;
        case PageLifeType.UNLOAD:
          {
            // 面包屑
            let bcIds = [];
            const breadcrumb = JSON.parse(breadcrumbJson);
            if (breadcrumb.length) {
              const bcs = breadcrumb.map(({ lid, bt, msg, t, l }: BreadCrumb) => ({
                type: bt,
                level: l,
                message: msg,
                event_id: lid,
                time: new Date(t),
                id: generateUUID()
              }));
              const { status: bcStatus } = await bcModel.add(bcs);
              if (bcStatus) {
                bcIds = bcs.map(({ id }) => id);
              }
            }
            if (!targetSession || data.length > 1) {
              throw new Error('session not found');
            }
            const { etime } = targetSession;
            let stayTime = 0;
            if (etime) {
              stayTime = otime.getTime() - etime.getTime();
            }
            response = await sessionModel.modify(
              { id: sid },
              {
                stay_time: stayTime,
                ltime: otime,
                breadcrumb: JSON.stringify(bcIds)
              }
            );
          }
          break;
        case RecordTypes.SESSION:
          {
            if (!targetSession) {
              // 不存在，新建
              response = await sessionModel.add([{ ...newSession, events: JSON.stringify(evs) }]);
            } else {
              const oriEvents = JSON.parse(targetSession.events || '[]') || [];
              response = await sessionModel.modify(
                { id: sid },
                {
                  events: JSON.stringify(oriEvents.concat(evs))
                }
              );
            }
          }
          break;

        default:
          response.msg = 'st not found';
          break;
      }
      const { status, msg } = response;
      if (!status) {
        console.error(TAG, msg);
      }
      res.send(successResponse(null, msg));
      // 页面生命周期时间不加logs
      return;
    }

    const logInfo: LogItem = {
      ascription_id: aid,
      session_id: sid,
      otime,
      type: logType,
      sub_type: `${st}`,
      data: JSON.stringify(paramObj),
      platform,
      path: url
    };
    const { data: count } = await logModel.count({ id: lid });
    if (count) {
      // 记录已存在，直接更新
      const { status, msg } = await logModel.modify({ id: lid }, logInfo);
      if (status) {
        res.send(successResponse(null, msg));
        return;
      }
      res.send(failResponse(msg));
      return;
    }
    // 新增
    const { status, msg } = await logModel.add([
      {
        id: lid,
        ...logInfo
      }
    ]);
    if (status) {
      res.send(successResponse(null, msg));
      return;
    }
    res.send(failResponse(msg));
  } catch (err) {
    res.send(failResponse(err.message || JSON.stringify(err)));
  }
}

/**
 * 列表
 * @param req
 * @param res
 */
export async function list(req, res) {
  const query = { ...req.query };
  const { psize, pindex, order, sort } = query;
  if (!psize || !pindex) {
    res.send(failResponse('missing psize or pindex'));
    return;
  }
  delete query.psize;
  delete query.pindex;
  delete query.order;
  delete query.sort;
  const { data: total } = await logModel.count(query);
  if (!total) {
    res.send(
      successResponse(
        {
          list: [],
          total: 0
        },
        'empty'
      )
    );
    return;
  }
  let orderBy: any = null;
  if (sort && order) {
    orderBy = {};
    orderBy[sort] = order;
  }
  const { status, data, msg } = await logModel.find(pindex, psize, query, orderBy);
  if (status) {
    const proj_ids = data?.map(({ ascription_id }) => ({ id: ascription_id }));
    const {
      status: proj_status,
      data: proj_datas = [],
      msg: proj_msg
    } = await projModel.find(0, 0, {
      OR: proj_ids
    });
    if (!proj_status) {
      console.error(proj_msg);
    }
    const projMap = proj_datas.reduce((pre, cur) => {
      const { id, name } = cur;
      pre[id] = name;
      return pre;
    }, {});
    res.send(
      successResponse(
        {
          list: data?.map((ele) => ({
            ...ele,
            ascription: projMap[ele.ascription_id] || ele.ascription_id
          })),
          total
        },
        msg
      )
    );
    return;
  }
  res.send(failResponse(msg));
}

/**
 * 详情
 * @param req
 * @param res
 */
export async function detail(req, res) {
  const query = { ...req.query };
  const { id } = query;
  if (!id) {
    res.send(failResponse('missing id'));
    return;
  }
  try {
    const { status, data = [], msg } = await logModel.find(1, 1, { id });
    if (!status) {
      throw new Error(msg);
    }
    // 归属应用名称
    let ascription_name = '';
    const [{ ascription_id }] = data || [];
    if (ascription_id) {
      const { status: prStatus, data: prData = [], msg: prMsg } = await projModel.find(1, 1, { id: ascription_id });
      if (!prStatus) {
        throw new Error(prMsg);
      }
      const [{ name = '' } = {}] = prData;
      ascription_name = name;
    }
    res.send(
      successResponse(
        {
          ...data[0],
          ascription_name
        },
        msg
      )
    );
  } catch (err) {
    res.send(failResponse(err.message || JSON.stringify(err)));
  }
}
