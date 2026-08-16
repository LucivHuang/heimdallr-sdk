import { failResponse, successResponse } from '../lib/utils';
import BreadCrumbModel from '../models/breadcrumbModel';
import SessionModel from '../models/sessionModel';
import { BreadCrumbRes } from '../types';

const sessionModel = new SessionModel();
const bcModel = new BreadCrumbModel();

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
  const { data: total } = await sessionModel.count(query);
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
  const { status, data, msg } = await sessionModel.find(pindex, psize, query, orderBy);
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
    const { status, data = [], msg } = await sessionModel.find(1, 1, { id });
    if (!status) {
      throw new Error(msg);
    }
    // 面包屑
    let breadcrumb: BreadCrumbRes[] = [];
    const [{ breadcrumb: bcJson = '[]' } = {}] = data || [];
    const bcIds = JSON.parse(bcJson || '[]');
    if (bcIds.length) {
      const bcQuery = bcIds.map((id: string) => ({ id }));
      const {
        status,
        data = [],
        msg
      } = await bcModel.find({
        OR: bcQuery
      });
      if (!status) {
        throw new Error(msg);
      }
      breadcrumb = data.sort((a, b) => bcIds.indexOf(a.id) - bcIds.indexOf(b.id));
    }
    res.send(successResponse(breadcrumb, msg));
  } catch (err) {
    res.send(failResponse(err.message || JSON.stringify(err)));
  }
}
