import { formatDecimal } from '@heimdallr-sdk/utils';

const IGNORE_TAG_SET = ['SCRIPT', 'STYLE', 'META', 'HEAD', 'LINK'];

const TAG_WEIGHT_MAP = {
  SVG: 2,
  IMG: 2,
  CANVAS: 4,
  OBJECT: 4,
  EMBED: 4,
  VIDEO: 4
};

const LIMIT = 1000;

const DELAY = 500;

interface ElTimeType {
  t: number;
}

interface ElsType {
  node: HTMLElement;
  st: number;
  weight: number;
}
interface ScoreParamType {
  dpss: ScoreParamType[];
  st: number;
  els: ElsType[];
}

class FMPTiming {
  statusCollector: ElTimeType[];
  flag: boolean;
  observer: MutationObserver;
  callbackCount: number;
  WW: number;
  WH: number;
  resourceMap: {};
  private readonly startTime: number;

  constructor() {
    const { responseEnd } = performance.timing;
    this.startTime = responseEnd;

    this.statusCollector = [];
    this.flag = true;
    this.observer = null;
    this.callbackCount = 1;
    this.resourceMap = {};

    this.WW = window.innerWidth;
    this.WH = window.innerHeight;
  }

  initObserver() {
    return new Promise<number>((rs) => {
      this.observer = new MutationObserver(() => {
        const t = Date.now() - this.startTime;
        const bodyTarget = document.body;

        if (bodyTarget) {
          this.doTag(bodyTarget, this.callbackCount++);
        }
        this.statusCollector.push({
          t
        });
      });

      this.observer.observe(document, {
        childList: true,
        subtree: true
      });

      if (document.readyState === 'complete') {
        this.calFinallScore().then((res) => rs(res));
        return;
      }
      window.addEventListener(
        'load',
        () => {
          this.calFinallScore().then((res) => rs(res));
        },
        true
      );
    });
  }

  /**
   * 获取当前样式
   * @param element
   * @param att
   * @returns
   */
  private getStyle(element: Element, att: string) {
    //特性侦测
    if (window.getComputedStyle) {
      //优先使用W3C规范
      return window.getComputedStyle(element)[att];
    }
    //针对IE9以下兼容
    return (element as any).currentStyle[att];
  }

  private initResourceMap() {
    performance.getEntriesByType('resource').forEach((item: PerformanceResourceTiming) => {
      this.resourceMap[item.name] = item.responseEnd;
    });
  }

  private doTag(target: Element, callbackCount: number) {
    const tagName = target.tagName;

    if (IGNORE_TAG_SET.includes(tagName)) {
      return;
    }

    const childrenLen = target.children ? target.children.length : 0;
    if (childrenLen > 0) {
      for (const child of Array.from(target.children)) {
        if (child.getAttribute('f_c') === null) {
          child.setAttribute('f_c', `${callbackCount}`);
        }
        this.doTag(child, callbackCount);
      }
    }
  }

  private calFinallScore(): Promise<number> {
    return new Promise((rs) => {
      if (!MutationObserver || !this.flag) {
        rs(null);
        return;
      }
      if (this.checkCanCal(this.startTime)) {
        this.observer.disconnect();
        this.flag = false;
        const res = this.deepTraversal(document.body);
        if (!res) {
          rs(null);
          return;
        }
        let tp: ScoreParamType = null;
        res.dpss.forEach((item) => {
          if (tp && tp.st) {
            if (tp.st < item.st) {
              tp = item;
            }
          } else {
            tp = item;
          }
        });
        this.initResourceMap();
        const resultSet = this.filterTheResultSet(tp.els);
        const fmpTiming = this.calResult(resultSet);
        rs(formatDecimal(fmpTiming, 3));
      } else {
        setTimeout(() => {
          this.calFinallScore().then((res) => {
            rs(res);
          });
        }, DELAY);
      }
    });
  }

  private calResult(resultSet: ElsType[]): number {
    let rt = 0;
    resultSet.forEach((item) => {
      let t = 0;
      const { node, weight } = item;
      const { tagName } = node;
      if (weight === 1) {
        const index = +node.getAttribute('f_c') - 1;
        t = this.statusCollector[index].t;
      } else if (weight === 2) {
        switch (tagName) {
          case 'IMG':
            {
              t = this.resourceMap[(node as HTMLImageElement).src];
            }
            break;
          case 'SVG':
            {
              const index = +node.getAttribute('f_c') - 1;
              t = this.statusCollector[index].t;
            }
            break;
          default:
            {
              // background image
              const match = this.getStyle(node, 'background-image').match(/url\("(.*?)"\)/);
              let s = '';
              if (match && match[1]) {
                s = match[1];
              }
              if (s.indexOf('http') == -1) {
                s = location.protocol + match[1];
              }
              t = this.resourceMap[s];
            }
            break;
        }
      } else if (weight === 4) {
        switch (tagName) {
          case 'CANVAS':
            {
              const index = +node.getAttribute('f_c') - 1;
              t = this.statusCollector[index].t;
            }

            break;
          case 'VIDEO':
            {
              const videoEl = node as HTMLVideoElement;
              t = this.resourceMap[videoEl.src];
              !t && (t = this.resourceMap[videoEl.poster]);
            }
            break;
          default:
            break;
        }
      }
      if (rt < t) {
        rt = t;
      }
    });
    return rt;
  }

  /**
   * 过滤出大于平均值的数据
   * @param els
   * @returns
   */
  private filterTheResultSet(els: ElsType[]): ElsType[] {
    let sum = 0;
    els.forEach((item) => {
      sum += item.st;
    });

    const avg = sum / els.length;

    return els.filter(({ st }) => st >= avg);
  }

  /**
   * 深度遍历
   * @param node
   * @returns
   */
  private deepTraversal(node: HTMLElement): ScoreParamType {
    if (!node) {
      return null;
    }
    const dpss = [];

    for (let i = 0, child; (child = node.children[i]); i++) {
      const s = this.deepTraversal(child);
      if (s.st) {
        dpss.push(s);
      }
    }

    return this.calScore(node, dpss);
  }

  private calScore(node: HTMLElement, dpss: ScoreParamType[]) {
    const { width, height, left, top } = node.getBoundingClientRect();
    let f = 1;

    if (this.WH < top || this.WW < left) {
      // 不在可视viewport中
      f = 0;
    }

    let sdp = 0;

    dpss.forEach((item) => {
      sdp += item.st;
    });

    let weight = TAG_WEIGHT_MAP[node.tagName] || 1; // 权重

    if (weight === 1 && !['initial', 'none'].includes(this.getStyle(node, 'background-image'))) {
      // 将有图片背景的普通元素 权重设置为img
      weight = TAG_WEIGHT_MAP['IMG'];
    }

    let st = width * height * weight * f;

    let els = [{ node, st, weight }];

    const areaPercent = this.calAreaPercent(node);

    if (sdp > st * areaPercent || areaPercent === 0) {
      st = sdp;
      els = [];

      dpss.forEach((item) => {
        els = els.concat(item.els);
      });
    }

    return {
      dpss,
      st,
      els
    };
  }

  /**
   * 判断页面是否已经“稳定”
   * @param {number} start
   * @returns {boolean}
   */
  private checkCanCal(start: number): boolean {
    const ti = Date.now() - start;
    return (
      ti > LIMIT ||
      ti - ((this.statusCollector && this.statusCollector.length && this.statusCollector[this.statusCollector.length - 1].t) || 0) > 1000
    );
  }

  private calAreaPercent(node: HTMLElement): number {
    const { left, right, top, bottom, width, height } = node.getBoundingClientRect();
    const wl = 0;
    const wt = 0;
    const wr = this.WW;
    const wb = this.WH;

    const overlapX = right - left + (wr - wl) - (Math.max(right, wr) - Math.min(left, wl));
    if (overlapX <= 0) {
      // x 轴无交点
      return 0;
    }

    const overlapY = bottom - top + (wb - wt) - (Math.max(bottom, wb) - Math.min(top, wt));
    if (overlapY <= 0) {
      return 0;
    }

    return (overlapX * overlapY) / (width * height);
  }
}

const getFMP = () =>
  new Promise<number>((rs) => {
    const fmpTiming = new FMPTiming();
    fmpTiming.initObserver().then((fmp) => {
      rs(fmp);
    });
  });

export default getFMP;
