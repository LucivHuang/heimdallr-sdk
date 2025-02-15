import { formatDecimal } from "@heimdallr-sdk/utils";
import { Metric, onFCP, onLCP, onINP, onCLS } from "web-vitals";
import { RenderMetrics } from "../types";
import getFMP from "./fmp";
import getFPS from "./fps";

const getFCP = () =>
  new Promise<number>((rs) => {
    onFCP(({ value }: Metric) => {
      rs(value);
    });
  });

const getLCP = () =>
  new Promise<number>((rs) => {
    onLCP(({ value }: Metric) => {
      rs(value);
    });
  });

const getINP = () =>
  new Promise<number>((rs) => {
    onINP(({ value }: Metric) => {
      rs(value);
    });
  });

const getCLS = () =>
  new Promise<number>((rs) => {
    onCLS(({ value }: Metric) => {
      rs(value);
    });
  });


const getRenderMetrics = async (): Promise<RenderMetrics> => {
  const [timing] = performance.getEntriesByType(
    "navigation"
  ) as PerformanceNavigationTiming[];
  const { domInteractive, fetchStart } = timing;
  const { startTime: fp } =
    performance
      .getEntriesByType("paint")
      .find(({ name }) => name === "first-paint") || {};
  const [fcp, lcp, inp, cls, fps, fmp] = await Promise.all([
    getFCP(),
    getLCP(),
    getINP(),
    getCLS(),
    getFPS(),
    getFMP()
  ]);
  return {
    fp: formatDecimal(fp, 3),
    fcp: formatDecimal(fcp, 3),
    lcp: formatDecimal(lcp, 3),
    tti: formatDecimal(domInteractive - fetchStart, 3),
    inp: formatDecimal(inp, 3),
    cls: formatDecimal(cls, 3),
    fps: formatDecimal(fps, 3),
    fmp: formatDecimal(fmp, 3)
  };
};

export default getRenderMetrics;
