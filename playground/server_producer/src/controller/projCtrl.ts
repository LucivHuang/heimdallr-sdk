import { failResponse, successResponse } from '../lib/utils';
import Rabbit from '../lib/rabbitMQ';

const mq = new Rabbit('localhost');

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
    res.send(successResponse(appInfo, msg));
  } else {
    res.send(failResponse(msg));
  }
}
