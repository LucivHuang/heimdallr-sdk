import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import size from 'rollup-plugin-sizes';
import esbuild from 'rollup-plugin-esbuild';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { dts } from 'rollup-plugin-dts';

const packageDir = path.resolve(__dirname);
const packageDirDist = `${packageDir}/dist`;

const name = path.basename(packageDir);

export const common = {
  input: `${packageDir}/src/index.ts`,
  output: {
    name: `HEIMDALLR_${name.toLocaleUpperCase()}`,
    footer: '/* follow me on Github! @LuciferHuang */',
    sourcemap: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    esbuild({
      include: /\.[jt]sx?$/,
      exclude: /node_modules/,
      target: 'es2015',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      tsconfig: 'tsconfig.json',
      loaders: {
        '.json': 'json',
        '.js': 'jsx'
      }
    }),
    resolve({
      preferBuiltins: true
    }), // 解析导入的第三方模块
    commonjs(), // 将CommonJS模块转换为ESM
    nodePolyfills(),
    json(),
    terser(),
    size()
  ]
};

export const declaration = {
  input: common.input,
  output: [{ file: 'esm/index.d.ts', format: 'es' }],
  plugins: [dts()]
};

export const umdPackage = {
  ...common,
  output: {
    file: `${packageDirDist}/${name}.umd.js`,
    format: 'umd',
    ...common.output
  }
};

export const esmPackage = {
  ...common,
  output: {
    dir: `${packageDir}/esm`,
    format: 'esm'
  }
};

export const iifePackage = {
  ...common,
  output: {
    file: `${packageDirDist}/${name}.iife.js`,
    format: 'iife',
    ...common.output
  },
  context: 'window'
};
