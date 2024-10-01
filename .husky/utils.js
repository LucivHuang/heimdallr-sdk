const chalk = require('chalk');
const childProcess = require('child_process');
const path = require('path');

/** 检查是否忽略文件名大小写 */
exports.checkCoreIgnorecase = () => {
  const isIgnorecase = childProcess.execSync('git config core.ignorecase').toString().trim();
  if (isIgnorecase === 'true') {
    console.log(
      chalk.red(
        `\n当前Git不区分文件名大小写，不允许提交\n请先设置 git config core.ignorecase false\n`,
      ),
    );
    process.exit(1);
  }
};
