const path = require('path');
<<<<<<< HEAD
const fs = require('fs');
const childProcess = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { getCommitPackageDir, groupFilesByCommitScope } = require('./libs/utils');

const rootDir = path.resolve(__dirname, '../');

const bumpVersion = (version, bumpType) => {
  const versionParts = version.split('.').map(Number);

  if (versionParts.length !== 3 || versionParts.some((item) => Number.isNaN(item))) {
    throw new Error(`Invalid version: ${version}`);
  }

  const [major, minor, patch] = versionParts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
};

const getChangeTitle = (bumpType) => {
  switch (bumpType) {
    case 'major':
      return 'Major Changes';
    case 'minor':
      return 'Minor Changes';
    case 'patch':
    default:
      return 'Patch Changes';
  }
};

const updateVersionAndChangelog = ({ packageDir, message, bumpType }) => {
  const packagePath = path.resolve(rootDir, packageDir, 'package.json');
  const changelogPath = path.resolve(rootDir, packageDir, 'CHANGELOG.md');

  if (!fs.existsSync(packagePath)) {
    throw new Error(`package.json not found in ${packageDir}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const nextVersion = bumpVersion(packageJson.version, bumpType);
  packageJson.version = nextVersion;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const changelogTitle = `# ${packageJson.name || path.basename(packageDir)}`;
  const changelogEntry = `## ${nextVersion}\n\n### ${getChangeTitle(bumpType)}\n\n- ${message}\n`;
  const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf-8').trim() : changelogTitle;
  const lines = changelog.split(/\r?\n/);
  const hasTitle = lines[0] && lines[0].startsWith('# ');
  const title = hasTitle ? lines[0] : changelogTitle;
  const body = hasTitle ? lines.slice(1).join('\n').trim() : changelog.trim();
  const nextChangelog = [title, changelogEntry, body].filter(Boolean).join('\n\n');

  fs.writeFileSync(changelogPath, `${nextChangelog}\n`);

  return {
    nextVersion,
    files: [packagePath, changelogPath]
  };
};

(async () => {
  const changedFiles = childProcess
    .execSync('git diff --name-only --diff-filter=ACMDUXB')
    .toString()
    .split('\n')
    .filter(Boolean);

  const stagedFiles = childProcess
    .execSync('git diff --cached --name-only --diff-filter=ACMDUXB')
=======
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
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
    .toString()
    .split('\n')
    .filter(Boolean);

<<<<<<< HEAD
  const newFiles = childProcess
    .execSync('git ls-files --others --exclude-standard')
=======
  // 获取新增未追踪的文件
  const newFiles = childProcess
    .execSync(`git status --porcelain | grep '^??' | cut -c4-`, { silent: true })
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
    .toString()
    .split('\n')
    .filter(Boolean);

<<<<<<< HEAD
  const files = Array.from(new Set([...changedFiles, ...stagedFiles, ...newFiles]));

  const categories = groupFilesByCommitScope(files);
=======
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
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f

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
<<<<<<< HEAD
=======
  // 如果只有一个选项，不需要选择
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
  if (choices.length > 1) {
    const res = await inquirer.prompt([
      {
        name: 'category',
        type: 'list',
        choices: choices,
<<<<<<< HEAD
        message: '请选择需要提交的 scope：'
=======
        message: '请选择需要提交的工作空间目录：'
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
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

<<<<<<< HEAD
  const { shouldUpdateVersion } = await inquirer.prompt([
    {
      name: 'shouldUpdateVersion',
      type: 'confirm',
      default: false,
      message: `[${category}] 是否使用 commit message 更新 version 和 CHANGELOG？`
    }
  ]);

  const addFiles = categories[category].map((file) => path.resolve(rootDir, file));

  try {
    if (shouldUpdateVersion) {
      const { bumpType } = await inquirer.prompt([
        {
          name: 'bumpType',
          type: 'list',
          choices: ['patch', 'minor', 'major'],
          default: 'patch',
          message: `[${category}] 请选择 version 更新类型：`
        }
      ]);
      const packageDir = getCommitPackageDir(categories[category][0]);
      const { files: versionFiles, nextVersion } = updateVersionAndChangelog({ packageDir, message, bumpType });
      addFiles.push(...versionFiles);
      console.log(chalk.green(`\n${packageDir} version updated to ${nextVersion}\n`));
    }

    childProcess.execFileSync('git', ['add', ...Array.from(new Set(addFiles))], { stdio: 'inherit' });
    childProcess.execSync(`git commit -m ${JSON.stringify(message)}`, {
      stdio: 'inherit'
    });
  } catch (error) {
    childProcess.execSync('git restore --staged .', {
      cwd: rootDir
    });
    console.log(chalk.red(`\n${error.message}\n`));
    process.exit(1);
=======
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
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
  }
})();
