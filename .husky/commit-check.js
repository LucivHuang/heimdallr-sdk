const chalk = require('chalk');
const fs = require('fs');
const childProcess = require('child_process');
const { checkCoreIgnorecase } = require('./utils');

checkCoreIgnorecase();

const msgPath = process.argv[process.argv.length - 1];
let commitMsg = fs.readFileSync(msgPath, 'utf-8').trim();

const ignoreCheckReg = /\s*--force$/;

// 如果带force表示强制提交，不做检查
if (ignoreCheckReg.test(commitMsg)) {
  fs.writeFileSync(msgPath, commitMsg.replace(ignoreCheckReg, ''));
  // 跳过后续逻辑，继续提交
  process.exit(0);
}

const content = fs.readFileSync('./pnpm-workspace.yaml', 'utf-8');
const spaces = content.split("- '").map((path) => path.replace("/*'\r\n", '').trim()).slice(1);

/** 获取要提交的暂存文件 */
const files = childProcess.execSync('git diff --cached --name-only --diff-filter=ACDMRU').toString().split('\n').filter(Boolean);

if (!files.length) {
  console.log(chalk.red('\n不存在待提交文件\n'));
  return;
}

for (const space of spaces) {
  const reg = new RegExp(`/^${space}\/([^\/]+)/`);
  const hasLibs = files.some((item) => reg.test(item));
  const everyLibs = files.every((item) => reg.test(item));
  const hasBothLibsAndOther = hasLibs && !everyLibs;
  if (hasBothLibsAndOther) {
    console.log(chalk.red(`\n请不要同时提交 ${space} 和其他文件\n`));
    process.exit(1);
  }
}

console.log(files);
