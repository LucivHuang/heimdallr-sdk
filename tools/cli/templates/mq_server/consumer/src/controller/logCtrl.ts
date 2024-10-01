import Rabbit from '../lib/rabbitMQ';
import { add as logAdd, list as logList, detail as logDetail } from '../lib/logBus';

const TAG = '[@heimdallr-sdk/server-consumer|logCtrl]:';

const mq = new Rabbit('localhost');

/**
 * 列表
 * @param req
 * @param res
 */
export async function list(req, res) {
  const query = { ...req.query };
  res.send(await logList(query));
}

/**
 * 详情
 * @param req
 * @param res
 */
export async function detail(req, res) {
  const query = { ...req.query };
  res.send(await logDetail(query));
}

mq.receiveQueueMsg(
  'logQueue',
  function (msg) {
    // 入库
    logAdd(msg).then((res) => {
      console.log(TAG, res);
    });
  },
  function (error) {
    console.error('消费失败', error);
  }
);
