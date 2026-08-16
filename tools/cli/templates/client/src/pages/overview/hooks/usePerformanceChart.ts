import * as echarts from 'echarts';
import { nextTick, reactive, ref } from 'vue';
import { getDateRange } from 'helper/utils';
import http from '@/helper/http';

enum StatisticMod {
  MON = 'month',
  WEEK = 'week',
  TDAY = 'today',
  YDAY = 'yesterday'
}

export default function useViewerChart(color: string[]) {
  const projList = reactive([]);

  const viewerOptions = [
    // {
    //   value: StatisticMod.TDAY,
    //   label: '今天'
    // },
    // {
    //   value: StatisticMod.YDAY,
    //   label: '昨天'
    // },
    {
      value: StatisticMod.WEEK,
      label: '7天'
    },
    {
      value: StatisticMod.MON,
      label: '30天'
    }
  ];
  let projects = [];
  let index = 0;
  async function init() {
    const res = await http.get('/project/list?pindex=0&psize=0');
    projects = (res as any).list || [];
    run();
  }
  function run() {
    const { id, name } = projects[index];
    if (!id) {
      next();
      return;
    }
    const proj = { id, name, range: StatisticMod.WEEK };
    projList.push(proj);
    nextTick(() => {
      render(proj, true);
    });
  }
  function next() {
    if (++index >= projects.length) {
      index = 0;
      return;
    }
    run();
  }
  function render(proj, isInit = false) {
    const { id, range } = proj;
    let days = 0;
    switch (range) {
      case StatisticMod.WEEK:
        days = 7;
        break;
      case StatisticMod.MON:
        days = 30;
        break;

      default:
        console.warn('未知时间段', range);
        return;
    }
    const dateRange = getDateRange(-days, 'MM-dd');
    const chart = echarts.init(document.getElementById(`${id}_chart`));
    chart.showLoading();
    http
      .get(`/statistic/proj?proj_id=${id}&mod=${range}`)
      .then((result) => {
        chart.setOption(getOptions(dateRange.slice(0, dateRange.length - 1), result));
        chart.hideLoading();
        if (isInit) {
          next();
        }
      })
      .catch((err) => {
        console.error(err);
        if (isInit) {
          next();
        }
      });
  }
  // 图表配置
  function getOptions(xdatas: string[], datas) {
    const { fmp: fmpMap = {}, err: errMap = {}, eapi: eapiMap = {}, api: apiMap = {} } = datas;
    const fmp = [];
    const err = [];
    const api = [];
    const eapi = [];
    const total = [];
    xdatas.forEach((date) => {
      const temp1 = fmpMap[date] || 0;
      fmp.push(fmpMap[date] || 0);
      const temp2 = errMap[date] || 0;
      err.push(temp2);
      const temp3 = eapiMap[date] || 0;
      eapi.push(temp3);
      const temp4 = apiMap[date] || 0;
      api.push(temp4);
      total.push(temp1 + temp2 + temp3 + temp4);
    });
    return {
      color,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          textStyle: {
            color: '#fff'
          }
        }
      },
      grid: {
        borderWidth: 0,
        top: '12%',
        bottom: '18%',
        left: '8%',
        right: '2%',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        x: '3%',
        top: '0%',
        textStyle: {
          color: '#90979c'
        },
        data: ['index', 'task']
      },
      calculable: true,
      xAxis: [
        {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#90979c'
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
          axisLabel: {
            interval: 0
          },
          data: xdatas
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            show: true
          },
          axisLabel: {
            interval: 0
          }
        }
      ],
      dataZoom: [
        {
          show: true,
          height: 20,
          xAxisIndex: [0],
          bottom: 8,
          start: 50,
          end: 100,
          handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
          handleSize: '110%',
          handleStyle: {
            color: '#d3dee5'
          },
          borderColor: '#90979c'
        },
        {
          type: 'inside',
          show: true,
          height: 15,
          start: 1,
          end: 35
        }
      ],
      series: [
        {
          name: '异常数',
          type: 'bar',
          stack: '总数',
          barMaxWidth: 28,
          barGap: '8%',
          itemStyle: {
            normal: {
              label: {
                show: true,
                textStyle: {
                  color: '#fff'
                },
                position: 'inside',
                formatter: function (p) {
                  return p.value > 0 ? p.value : '';
                }
              }
            }
          },
          data: err
        },
        {
          name: '异常API',
          type: 'bar',
          stack: '总数',
          barGap: '8%',
          itemStyle: {
            normal: {
              label: {
                show: true,
                textStyle: {
                  color: '#fff'
                },
                position: 'inside',
                formatter: function (p) {
                  return p.value > 0 ? p.value : '';
                }
              }
            }
          },
          data: eapi
        },
        {
          name: '慢页面',
          type: 'bar',
          stack: '总数',
          itemStyle: {
            normal: {
              barBorderRadius: 0,
              label: {
                show: true,
                position: 'inside',
                textStyle: {
                  color: '#fff'
                },
                formatter: function (p) {
                  return p.value > 0 ? p.value : '';
                }
              }
            }
          },
          data: fmp
        },
        {
          name: '慢API',
          type: 'bar',
          stack: '总数',
          itemStyle: {
            normal: {
              barBorderRadius: 0,
              label: {
                show: true,
                position: 'inside',
                textStyle: {
                  color: '#fff'
                },
                formatter: function (p) {
                  return p.value > 0 ? p.value : '';
                }
              }
            }
          },
          data: api
        },
        {
          name: '总数',
          type: 'line',
          symbolSize: 10,
          symbol: 'circle',
          itemStyle: {
            normal: {
              barBorderRadius: 0,
              label: {
                show: true,
                position: 'top',
                formatter: function (p) {
                  return p.value > 0 ? p.value : '';
                }
              }
            }
          },
          data: total
        }
      ]
    };
  }
  function onViewChange(proj) {
    render(proj);
  }
  return {
    projList,
    viewerOptions,
    onViewChange,
    init
  };
}
