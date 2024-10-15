import { nanoid } from 'nanoid';
import { failResponse, successResponse } from '../lib/utils';
import Rabbit from '../lib/rabbitMQ';

const mq = new Rabbit('<%= rabbit_host %>');

export async function init(req, res) {
  const appInfo = { ...req.query };
  const { name } = appInfo;
  if (!name) {
    res.send(failResponse('missing name'));
    return;
  }
  appInfo.id = nanoid();
  appInfo.ctime = new Date();
  // 入列
  const { code, msg } = await mq.sendQueueMsg('projQueue', JSON.stringify(appInfo));
  if (code === 0) {
    res.send(successResponse(null, msg));
  } else {
    res.send(failResponse(msg));
  }
}
