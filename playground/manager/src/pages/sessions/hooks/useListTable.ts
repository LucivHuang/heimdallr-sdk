import { deserializeArr } from 'type-json-mapper';
import { computed, nextTick, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import http from 'helper/http';
import { DEFAULT_PAGE_SIZE } from 'config/others';
import { copy, cusToRefs, formatDate, decodeRecordEvents } from 'helper/utils';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { Session, tableDeserialize } from '@/models/session';
import { TableOperateType } from './useListConfig';
import { Breadcrumb } from '@/models/log';

export default function useListTable() {
  const state = reactive({
    tableData: [],
    form: {},
    allItems: 0,
    detail: {},
    isDrawerShow: false,
    isPlayerShow: false
  });
  // 翻页
  const page = { index: 1, size: DEFAULT_PAGE_SIZE };
  function pageHandle({ pindex, psize }) {
    page.index = pindex;
    page.size = psize;
    loadData();
  }
  // 排序
  let sortParams: any = {
    orderParam: 'order',
    sortParam: 'sort',
    sortVal: 'etime',
    order: 'desc'
  };
  function sortHandle(params) {
    sortParams = params;
    loadData();
  }
  // 加载数据
  function loadData() {
    const params = cusToRefs(state.form);
    if (Object.keys(sortParams).length) {
      const { orderParam, sortParam, sortVal, order } = sortParams;
      params[sortParam] = sortVal;
      params[orderParam] = order;
    }
    const paramStr = Object.keys(params).reduce((pre, cur) => {
      const value = params[cur];
      let paramValue = value;
      if (value) {
        if (Array.isArray(value)) {
          paramValue = value.map((time) => formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')).join('+');
        }
        pre += `&${cur}=${encodeURIComponent(paramValue)}`;
      }
      return pre;
    }, '');
    const { index, size } = page;
    state.tableData = [];
    const url = `/session/list?psize=${size}&pindex=${index}${paramStr}`;
    http
      .get(url)
      .then((res: any) => {
        const { total = 0, list = [] } = res;
        state.tableData = tableDeserialize(list);
        state.allItems = total;
      })
      .catch(() => {});
  }
  // 多选
  let selected = [];
  function selectHandle(val) {
    selected = val;
  }
  // 批量操作
  function batchHandle(cmd: string) {
    switch (cmd) {
      case 'copy':
        if (!selected.length) {
          ElMessage.warning('至少选择一项');
          return;
        }
        copy(
          selected
            .map(({ id }) => id)
            .filter((k) => k)
            .join('|')
        )
          ? ElMessage.success('已复制成功，可使用快捷键 CTRL+V 粘贴')
          : ElMessage.error('复制失败，请稍后重试');
        break;
      default:
        break;
    }
  }
  // 表格操作
  function operateHandle(cmd: TableOperateType, row: Session) {
    const { id, path, pageTitle, etime, ltime, ip, userId, province, language, events = '', docSize, winSize, userAgent } = row;
    switch (cmd) {
      case TableOperateType.DETAIL:
        // 弹出详情
        state.detail = {};
        http
          .get(`/session/detail?id=${id}`)
          .then((res: any) => {
            state.isDrawerShow = true;
            state.detail = {
              path,
              ip,
              userId,
              province,
              language,
              pageTitle,
              etime,
              ltime,
              docSize,
              winSize,
              userAgent,
              breadcrumb: deserializeArr(Breadcrumb, res || [])
            };
          })
          .catch(() => {});
        break;
      case TableOperateType.PLAY:
        if (!events) {
          ElMessage.warning('录屏不存在');
          return;
        }
        state.detail = {
          path
        };
        state.isPlayerShow = true;
        try {
          const eventsArr = JSON.parse(events);
          const oriEvents = decodeRecordEvents(eventsArr);
          nextTick(() => {
            new rrwebPlayer({
              target: document.getElementById('sessionPlayWrap'),
              // 配置项
              props: {
                events: oriEvents,
                width: 800,
                height: 450
              }
            });
          });
        } catch (error) {
          console.error = error;
        }
        break;
      default:
        break;
    }
  }
  const detail = computed(() => state.detail || {});
  return {
    state,
    detail,
    loadData,
    pageHandle,
    selectHandle,
    batchHandle,
    operateHandle,
    sortHandle
  };
}
