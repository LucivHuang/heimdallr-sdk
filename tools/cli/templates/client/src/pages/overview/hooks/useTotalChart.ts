import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import http from 'helper/http';

export default function useTotalChart(colors: string[]) {
  const totalBars = ref([
    {
      field: 'err',
      label: '异常数',
      color: '',
      value: 0,
      inc: 0
    },
    {
      field: 'eapi',
      label: '异常API数',
      color: '',
      value: 0,
      inc: 0
    },
    {
      field: 'fmp',
      label: '慢页面数',
      color: '',
      value: 0,
      inc: 0
    },
    {
      field: 'api',
      label: '慢API数',
      color: '',
      value: 0,
      inc: 0
    },
  ]);
  http
    .get('/statistic/total')
    .then((res: any) => {
      totalBars.value.forEach((bar, index) => {
        bar.color = colors[index];
        bar.value = res[bar.field];
        bar.inc = res[`${bar.field}Inc`];
      });
    })
    .catch((err) => {
      console.error(err);
      ElMessage.error(err.message || '获取总览数据失败');
    });
  return {
    totalBars
  };
}
