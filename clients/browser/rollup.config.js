import { declaration, umdPackage, iifePackage, esmPackage } from '../../rollup.config.base';

// iife 增加自调用逻辑
const footer = `if (window.__HEIMDALLR_OPTIONS__ && HEIMDALLR_BROWSER) {HEIMDALLR_BROWSER(window.__HEIMDALLR_OPTIONS__);}\n${iifePackage.output.footer}`;

export default [
  declaration,
  esmPackage,
  umdPackage,
  {
    ...iifePackage,
    output: {
      ...iifePackage.output,
      footer
    }
  }
];
