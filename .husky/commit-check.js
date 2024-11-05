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
const spaces = content
  .split("- '")
  .map((path) => path.replace("/*'\r\n", '').trim())
  .slice(1);

/** 获取要提交的暂存文件 */
const files = childProcess.execSync('git diff --cached --name-only --diff-filter=ACDMRU').toString().split('\n').filter(Boolean);

if (!files.length) {
  console.log(chalk.red('\n不存在待提交文件\n'));
  return;
}

let submittedWorkspace = ''; // 用于记录匹配的工作空间目录
let isMixedSubmission = false; // 标记是否有混合提交

spaces.forEach((space) => {
  const reg = new RegExp(`^${space}/([^/]+)`);
  const hasLibs = files.some((item) => reg.test(item));
  const everyLibs = submittedWorkspace === '' ? files.every((item) => reg.test(item)) : false;

  // 如果提交的都是同一个工作空间的文件，记录这个工作空间
  if (hasLibs && everyLibs && !submittedWorkspace) {
    submittedWorkspace = space;
  } else if (hasLibs && submittedWorkspace) {
    // 如果发现属于另一个工作空间的文件，设置混合提交标记
    isMixedSubmission = true;
  }
});

if (isMixedSubmission) {
  console.log(chalk.red(`\n请不要同时提交不同的工作空间目录文件\n`));
  process.exit(1);
} else if (submittedWorkspace) {
  console.log(chalk.green(`\n所有文件均属于同一工作空间目录：${submittedWorkspace}\n`));
} else {
  console.log(chalk.red(`\n提交的文件不属于任何配置的工作空间目录\n`));
}

if (submittedWorkspace) {
  // 如果是应用，则在commit message中添加【应用名称】
  const appCommitReg = /^([a-z]+):/;
  const newMsg = commitMsg.replace(appCommitReg, (match, p1) => {
    return match.replace(p1, `${p1}(${submittedWorkspace})`);
  });
  fs.writeFileSync(msgPath, newMsg);
}