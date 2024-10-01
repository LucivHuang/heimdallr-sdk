import { formatDecimal } from "@heimdallr-sdk/utils";

class FpsTool {
  private lastTime: number;
  private frame: number;
  private fps: number;
  private lastFameTime: number;
  private animationFramId: number;
  constructor() {
    this.lastFameTime = performance.now();
    this.frame = 0;
    this.fps = 0;
    this.lastFameTime = performance.now();
  }
  run() {
    const now = performance.now();
    const fs = now - this.lastFameTime;
    this.lastFameTime = now;
    this.fps = Math.round(1000 / fs);
    this.frame++;
    if (now > 1000 + this.lastTime) {
      this.fps = Math.round((this.frame * 1000) / (now - this.lastTime));
      this.frame = 0;
      this.lastTime = now;
    }
    this.animationFramId = window.requestAnimationFrame(() => {
      this.run();
    });
  }
  get(): number {
    return formatDecimal(this.fps, 3);
  }
  destroy() {
    cancelAnimationFrame(this.animationFramId);
  }
}

export default FpsTool;
