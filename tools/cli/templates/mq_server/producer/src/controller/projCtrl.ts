import { failResponse, successResponse } from '../lib/utils';
import Rabbit from '../lib/rabbitMQ';

const mq = new Rabbit('<%= rabbit_host %>');

export async function init(req, res) {
  const appInfo = { ...req.query };
  const { id, name } = appInfo;
  if (!id && !name) {
    res.send(failResponse('missing id or name'));
    return;
  }
  // 入列
  const { code, msg } = await mq.sendQueueMsg('projQueue', JSON.stringify(appInfo));
  if (code === 0) {
    res.send(successResponse(null, msg));
  } else {
    res.send(failResponse(msg));
  }
}
