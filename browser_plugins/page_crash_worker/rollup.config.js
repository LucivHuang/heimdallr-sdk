import { iifePackage } from '../../rollup.config.base';

const footer = `if (HEIMDALLR_PAGE_CRASH_WORKER) {new HEIMDALLR_PAGE_CRASH_WORKER();}\n${iifePackage.output.footer}`;

export default [
  {
    ...iifePackage,
    output: {
      ...iifePackage.output,
      footer
    }
  }
];
