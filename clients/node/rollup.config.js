import { declaration, esmPackage, umdPackage } from '../../rollup.config.base';

umdPackage.output.inlineDynamicImports = true;

export default [declaration, esmPackage, umdPackage];
