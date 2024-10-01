#!/usr/bin/env node
const { readdirSync, lstatSync, existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const { prompt } = require('inquirer');
const { renderFile } = require('ejs');
const { successBox, errorBox } = require('./lib/utils');
const { BASE_QS, SERVER_QS, RABBIT_QS, CLIENT_QS } = require('./lib/questions');

// main

prompt([
  {
    type: 'list',
    name: 'template',
    message: 'Please select a template ?',
    choices: ['client', 'server', 'server with RabbitMQ'],
    default: 'client'
  }
]).then(async (templateAnwsers) => {
  const { template } = templateAnwsers;
  const projName = `heimdallr_${template === 'server with RabbitMQ' ? 'mqserver' : template}`;
  const anwsers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name ?',
      default: projName
    },
    ...BASE_QS
  ]);

  let templateDir = template;
  let clientAnswer = {};
  let serverAnswer = {};
  let mqServerAnswer = {};
  switch (template) {
    case 'client':
      clientAnswer = await prompt(CLIENT_QS);
      break;
    case 'server':
      serverAnswer = await prompt(SERVER_QS);
      break;
    case 'server with RabbitMQ':
      templateDir = 'mq_server';
      mqServerAnswer = await prompt([...SERVER_QS, ...RABBIT_QS]);
      break;
    default:
      break;
  }

  let isSuccess = true;
  // 创建项目目录
  const { name = projName } = anwsers;
  const projectDir = join(process.cwd(), name);
  mkdir(projectDir);

  // 开始读取模板目录文件

  readTempl(join(__dirname, 'templates', templateDir), projectDir);

  if (isSuccess) {
    process.stdout.write(successBox(`您可以通过以下命令运行项目：\n\n$ cd ${name} \n$ npm install \n$ npm run dev`, `${name} 创建完成 🎉`));
  }

  function readTempl(templDir, distDir) {
    try {
      const files = readdirSync(templDir);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      files.forEach(async (file) => {
        const filePath = join(templDir, file);
        const isDir = lstatSync(filePath).isDirectory();
        const clientDir = join(distDir, file);
        if (isDir) {
          mkdir(clientDir);
          readTempl(filePath, clientDir);
        } else {
          await transTempl(clientDir, filePath);
        }
      });
    } catch (error) {
      isSuccess = false;
      process.stdout.write(errorBox(error, '创建失败'));
    }
  }
  // 创建目录
  function mkdir(clientDir) {
    if (!existsSync(clientDir)) {
      mkdirSync(clientDir);
    }
  }
  // 替换模板
  function transTempl(clientDir, filePath) {
    return new Promise((rs) => {
      try {
        if (['.jpg', '.jpeg', '.png', '.gif'].filter((formate) => filePath.includes(formate)).length) {
          writeFileSync(clientDir, readFileSync(filePath));
          rs(true);
        } else {
          renderFile(filePath, { ...anwsers, ...serverAnswer, ...clientAnswer, ...mqServerAnswer }, (err, result) => {
            if (err) throw err;
            writeFileSync(clientDir, result);
            rs(true);
          });
        }
      } catch (err) {
        isSuccess = false;
        process.stdout.write(errorBox(err, '模板替换出错'));
        rs(false);
      }
    });
  }
});
