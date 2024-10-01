#!/usr/bin/env node
const { readdirSync } = require('fs');
const { prompt } = require('inquirer');
const { join } = require('path');
const childProcess = require('child_process');
const { getDirByType, getPkgOptsByMode, IGNORES } = require('./libs/utils');

const PACKAGE_PRE = '@heimdallr-sdk/';

async function run() {
  const mode = process.env.NODE_ENV;

  const { package } = await prompt([
    {
      type: 'list',
      name: 'package',
      message: '请选择要运行的项目类型 ?',
      choices: getPkgOptsByMode(mode),
      default: 'clients'
    }
  ]);

  const dir = getDirByType(package);

  if (!dir) {
    console.warn(`目录不存在(${package})`);
    return;
  }

  if (dir === 'docs') {
    // 文档项目，直接启动
    try {
      childProcess.execSync(`concurrently "pnpm --filter ${PACKAGE_PRE}${dir} ${mode}"`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.log('==== ✔ 终止成功，轻敲回车退出 ↩ =====');
      process.exit();
    }
    return;
  }

  const packageOptions = readdirSync(join(__dirname, '../', dir));

  if (!packageOptions.length) {
    console.warn('选项丢失');
    return;
  }

  const { project } = await prompt([
    {
      type: 'checkbox',
      name: 'project',
      message: '请选择要运行的项目?',
      choices: packageOptions.filter((name) => !IGNORES.includes(name)),
      validate: (val) => (val.length ? true : '至少选择一个项目')
    }
  ]);

  let libs = [];
  if (project.includes('browser') || project.includes('wx') || project.includes('node')) {
    libs = readdirSync(join(__dirname, '../', 'libs'));
  }
  if (dir === 'tools') {
    libs = ['@heimdallr-sdk/types'];
  }

  let plugins = [];

  if (project.includes('browser')) {
    plugins = readdirSync(join(__dirname, '../', 'browser_plugins'));
  }

  if (project.includes('wx')) {
    plugins = [...plugins, ...readdirSync(join(__dirname, '../', 'wx_plugins'))];
  }

  let execCommand = '';
  switch (mode) {
    case 'development':
      execCommand = 'dev';
      break;
    case 'production':
      execCommand = 'build';
      break;
    default:
      break;
  }

  if (!execCommand) {
    console.warn('指令丢失');
    return;
  }

  try {
    childProcess.execSync(
      `concurrently ${[...libs, ...project, ...plugins]
        .map((name) => `"pnpm --filter ${PACKAGE_PRE}${name.replace(/_/g, '-')} ${execCommand}"`)
        .join(' ')}`,
      {
        stdio: 'inherit'
      }
    );
  } catch (error) {
    console.log('==== ✔ 终止成功，轻敲回车退出 ↩ =====');
    process.exit();
  }
}

run();
