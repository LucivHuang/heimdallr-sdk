import Rabbit from '../lib/rabbitMQ';
import { failResponse, successResponse } from '../lib/utils';
import ProjModel from '../models/projModel';

const TAG = '[@heimdallr-sdk/server-consumer|projCtrl]:';

const mq = new Rabbit('localhost');
const projModel = new ProjModel();

export async function init(req, res) {
  const appInfo = { ...req.query };
  const { id, name } = appInfo;
  if (!id && !name) {
    res.send(failResponse('missing id or name'));
    return;
  }
  const { data: projects } = await projModel.find(1, 1, { name });
  if (projects && projects.length) {
    res.send(successResponse(projects[0], 'already exist'));
    return;
  }
  appInfo.ctime = new Date();
  const { status, msg } = await projModel.add([appInfo]);
  if (status) {
    res.send(successResponse(appInfo, msg));
    return;
  }
  res.send(failResponse(msg));
}

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
  const { data: total } = await projModel.count(query);
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
  const { status, data, msg } = await projModel.find(pindex, psize, query, orderBy);
  if (status) {
    res.send(
      successResponse(
        {
          list: data,
          total
        },
        msg
      )
    );
    return;
  }
  res.send(failResponse(msg));
}

mq.receiveQueueMsg(
  'projQueue',
  function (msg) {
    try {
      const params = JSON.parse(msg);
      const { name } = params;
      projModel.count({ name }).then(({ data: count }) => {
        if (count) {
          console.warn(TAG, 'already exist');
          return;
        }
        projModel.add([params]).then(({ status, msg }) => {
          if (!status) {
            console.error(TAG, msg);
          }
        });
      });
    } catch (error) {
      console.error(TAG, error.message);
    }
  },
  function (error) {
    console.error('消费失败', error);
  }
);
