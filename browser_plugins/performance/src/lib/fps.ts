import { formatDecimal } from '@heimdallr-sdk/utils';

class FpsTiming {
  private lastTime: number;
  private frame: number;
  private fps: number;
  private lastFrameTime: number;
  private animationFrameId: number;
  constructor() {
    this.lastTime = performance.now();
    this.frame = 0;
    this.fps = 0;
    this.lastFrameTime = performance.now();
  }
  run() {
    const now = performance.now();
    const fs = now - this.lastFrameTime;
    /** 瞬时 FPS */
    this.fps = Math.round(1000 / fs);
    this.lastFrameTime = now;
    this.frame++;
    if (now > 1000 + this.lastTime) {
      /**平均FPS */
      this.fps = Math.round((this.frame * 1000) / (now - this.lastTime));
      this.frame = 0;
      this.lastTime = now;
    }
    this.animationFrameId = window.requestAnimationFrame(() => {
      this.run();
    });
  }
  get(): number {
    return formatDecimal(this.fps, 3);
  }
  destroy() {
    cancelAnimationFrame(this.animationFrameId);
  }
}

const getFPS = () =>
  new Promise<number>((rs) => {
    const fpsTool = new FpsTiming();
    fpsTool.run();
    setTimeout(() => {
      rs(fpsTool.get());
      fpsTool.destroy();
    }, 1000);
  });

export default getFPS;
