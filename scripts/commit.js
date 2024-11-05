const path = require('path');
const childProcess = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const {
  isBelongLibs,
  isBelongCli,
  isBelongBrowserPlugins,
  isBelongWxPlugins,
  isBelongTools,
  isBelongPlayground,
  isBelongDocs
} = require('./libs/utils');

(async () => {
  /** 获取工作区改变的文件 */
  const files = childProcess
    .execSync('git diff --name-only --diff-filter=ACMDUXB', { silent: true })
    .toString()
    .split('\n')
    .filter(Boolean);

  // 获取新增未追踪的文件
  const newFiles = childProcess
    .execSync(`git status --porcelain | grep '^??' | cut -c4-`, { silent: true })
    .toString()
    .split('\n')
    .filter(Boolean);

  files.push(...newFiles);

  const categories = {
    libs: [],
    clients: [],
    browser_plugins: [],
    wx_plugins: [],
    tools: [],
    playground: [],
    docs: [],
    sdk: []
  };

  files.forEach((file) => {
    switch (true) {
      case isBelongLibs(file):
        categories.libs.push(file);
        break;

      case isBelongCli(file):
        categories.clients.push(file);
        break;

      case isBelongBrowserPlugins(file):
        categories.browser_plugins.push(file);
        break;

      case isBelongWxPlugins(file):
        categories.wx_plugins.push(file);
        break;

      case isBelongTools(file):
        categories.tools.push(file);
        break;

      case isBelongPlayground(file):
        categories.playground.push(file);
        break;

      case isBelongDocs(file):
        categories.docs.push(file);
        break;

      default:
        categories.sdk.push(file);
        break;
    }
  });

  const choices = Object.keys(categories).reduce((choices, key) => {
    if (categories[key].length > 0) {
      choices.push(key);
    }
    return choices;
  }, []);

  if (choices.length === 0) {
    console.log(chalk.keyword('orange')('\n没有需要提交的文件\n'));
    process.exit(0);
  }

  let category = choices[0];
  // 如果只有一个选项，不需要选择
  if (choices.length > 1) {
    const res = await inquirer.prompt([
      {
        name: 'category',
        type: 'list',
        choices: choices,
        message: '请选择需要提交的工作空间目录：'
      }
    ]);
    category = res.category;
  }

  const { message } = await inquirer.prompt([
    {
      name: 'message',
      type: 'input',
      message: `[${category}] 请输入 commit message：`,
      validate: (value) => (!value.trim() ? '必填项' : true)
    }
  ]);

  //路径改成绝对路径
  const addFiles = categories[category.replace('/', '.')].map((file) => path.resolve(__dirname, '../', file));

  try {
    childProcess.execSync(`git add ${addFiles.join(' ')}`, { stdio: 'inherit' });
    childProcess.execSync(`git commit -m ${JSON.stringify(message)}`, {
      stdio: 'inherit'
    });
  } catch (_) {
    // 如果提交失败，取消暂存
    childProcess.execSync(`git restore --staged .`, {
      cwd: path.resolve(__dirname, '../../..')
    });
  }
})();
