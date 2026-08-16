const chalk = require('chalk');
const fs = require('fs');
const childProcess = require('child_process');
const { checkCoreIgnorecase } = require('./utils');
const { groupFilesByCommitScope } = require('../scripts/libs/utils');

checkCoreIgnorecase();

const msgPath = process.argv[process.argv.length - 1];
let commitMsg = fs.readFileSync(msgPath, 'utf-8').trim();

const ignoreCheckReg = /\s*--force$/;

// Skip scope checks when commit message ends with --force.
if (ignoreCheckReg.test(commitMsg)) {
  fs.writeFileSync(msgPath, commitMsg.replace(ignoreCheckReg, ''));
  process.exit(0);
}

const files = childProcess.execSync('git diff --cached --name-only --diff-filter=ACDMRU').toString().split('\n').filter(Boolean);

if (!files.length) {
  console.log(chalk.red('\nNo staged files to commit\n'));
  process.exit(1);
}

const scopeGroups = groupFilesByCommitScope(files);
const scopes = Object.keys(scopeGroups);
const submittedScope = scopes[0];

if (scopes.length > 1) {
  console.log(chalk.red(`\nPlease do not commit files from different scopes at the same time: ${scopes.join(', ')}\n`));
  process.exit(1);
}

console.log(chalk.green(`\nAll staged files belong to the same commit scope: ${submittedScope}\n`));

const appCommitReg = /^([a-z]+)(\([^)]+\))?:/;
const newMsg = commitMsg.replace(appCommitReg, (match, p1) => {
  return match.replace(/^([a-z]+)(\([^)]+\))?/, `${p1}(${submittedScope})`);
});

fs.writeFileSync(msgPath, newMsg);
