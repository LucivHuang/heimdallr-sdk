import { BaseOptionsType, BasePluginType, IAnyObject, ConsoleTypes, TAG } from '@heimdallr-sdk/types';
import { formateUrlPath } from '@heimdallr-sdk/utils';
import { Subscribe } from './libs/subscribe';
import { CoreContextType } from './types';

/**
 * 核心抽象类
 * @export
 * @class Core
 * @template O 配置信息
 * @template E 事件枚举
 */
export abstract class Core<O extends BaseOptionsType> {
  private readonly options: O;

  private context: CoreContextType;
  protected appID: string;
  protected readonly taskQueue: Array<IAnyObject>;
  private isReady: Boolean;

  constructor(options: O) {
    this.options = options;
    this.initConsole();
    if (!this.isRightEnv()) {
      console.warn(TAG, 'Client does not match the environment');
      return;
    }
    this.bindOptions();
    this.isReady = false;
    this.taskQueue = [];
    this.initAPP().then((id) => {
      // 处理应用id
      if (id && this.appID !== id) {
        this.appID = id;
      }
      // 开始执行上报
      this.isReady = true;
      this.executeTaskQueue();
    });
  }

  /**
   * 初始化 console
   */
   initConsole() {
    const { debug } = this.options;
    if (debug && typeof console !== 'undefined') {
      return;
    }
    Object.keys(ConsoleTypes).forEach((type) => {
      console[type] = () => null;
    });
  }

  /**
   * 绑定配置
   */
  private bindOptions() {
    const { dsn, app, debug = false, enabled = true } = this.options;

    if (!app || !dsn) {
      console.warn(TAG, 'Missing app or dsn in options');
      return;
    }

    const { host, init, report = '' } = dsn;
    const initUrl = formateUrlPath(host, init);
    const uploadUrl = formateUrlPath(host, report);

    this.context = {
      app,
      uploadUrl,
      initUrl,
      debug,
      enabled
    };
  }

  /**
   * 引用插件
   * @param {BasePluginType[]} plugins - 用户传入的应用信息
   */
  use(plugins: BasePluginType[]) {
    const { uploadUrl, enabled } = this.context;
    const sub = new Subscribe();
    const map = new Map<string, number>();
    for (const plugin of plugins) {
      const { name, monitor, transform } = plugin || {};
      if (!name || !monitor) {
        console.warn(`The plugin missing name or monitor.`);
        continue;
      }
      if (map.has(name)) {
        console.warn(`The plugin name [${name}] is duplicate, please modify it.`);
        continue;
      }
      map.set(name, 1);
      try {
        monitor.call(this, sub.notify.bind(sub, name));
      } catch (error) {
        console.error(error);
      }
      const callback = (...args: any[]) => {
        const pluginDatas = typeof transform === 'function' ? transform.apply(this, args) : args;
        if (!pluginDatas) {
          return;
        }
        const datas = this.transform(pluginDatas);
        if (!datas) {
          return;
        }
        if (!enabled) {
          return;
        }
        if (!this.isReady) {
          // 应用未初始化，暂存任务
          this.taskQueue.push(datas);
          return;
        }
        this.nextTick(this.report, this, uploadUrl, { aid: this.appID, ...datas });
      };
      sub.watch(name, callback);
    }
  }

  /**
   * 执行任务队列
   */
  executeTaskQueue() {
    const { uploadUrl } = this.context;
    while (this.taskQueue.length) {
      const task = this.taskQueue.shift();
      this.nextTick(this.report, this, uploadUrl, { aid: this.appID, ...task });
    }
  }

  /**
   * 获取客户端配置
   */
  getClientOptions() {
    return { ...this.options };
  }

  /**
   * 获取上下文
   */
  getContext() {
    return { ...this.context };
  }

  /**
   * 抽象方法，判断当前环境
   */
  abstract isRightEnv(): boolean;

  /**
   * 抽象方法，nextTick
   */
  abstract nextTick(cb: Function, ctx: Object, ...args: any[]): void;

  /**
   * 抽象方法，注册/初始化应用
   * @return {string} 应用id
   */
  abstract initAPP(): Promise<string>;

  /**
   * 抽象方法，端的个性化数据，需子类自己实现
   * @param {IAnyObject} datas
   */
  abstract transform(datas: IAnyObject): IAnyObject;

  /**
   * 抽象方法，端的请求方式不一致，需子类自己实现
   * @param {string} url - 接口地址
   * @param {} type - 请求方式（枚举类型，各端有差异）
   * @param {IAnyObject} datas - 上传数据
   */
  abstract report(url: string, datas: IAnyObject, type?: any): void;
}
