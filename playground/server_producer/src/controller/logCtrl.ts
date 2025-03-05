import { failResponse, successResponse } from '../lib/utils';
import { IPInfo } from '../types';
import Rabbit from '../lib/rabbitMQ';

const mq = new Rabbit('localhost');

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
  const { aid, lid } = param;
  if (!lid || !aid) {
    res.send(failResponse('missing lid or aid'));
    return;
  }
  // 入列
  const { code, msg } = await mq.sendQueueMsg('logQueue', JSON.stringify({ param, ipInfo }));
  if (code === 0) {
    res.send(successResponse(null, msg));
  } else {
    res.send(failResponse(msg));
  }
}
