#!/usr/bin/env node
const {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} = require('fs');
const { basename, join, resolve } = require('path');
const { prompt } = require('inquirer');
const { successBox, errorBox, infoBox } = require('./lib/utils');
const { BASE_QS, SERVER_QS, RABBIT_QS, CLIENT_QS } = require('./lib/questions');

const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.turbo', '.vite']);

const PLAYGROUND_TEMPLATES = {
  manager: {
    label: 'manager',
    defaultName: 'heimdallr_manager',
    sources: ['manager'],
    questions: CLIENT_QS
  },
  server: {
    label: 'server',
    defaultName: 'heimdallr_server',
    sources: ['server'],
    questions: SERVER_QS
  },
  'server-rabbitmq': {
    label: 'server with RabbitMQ',
    defaultName: 'heimdallr_mqserver',
    sources: ['server_consumer', 'server_producer'],
    questions: [...SERVER_QS, ...RABBIT_QS]
  },
  'mock-app': {
    label: 'mock app',
    defaultName: 'heimdallr_mock_app',
    sources: ['mock_app'],
    questions: CLIENT_QS
  }
};

function parseArgs(argv) {
  const args = { _: [] };
  const normalizeKey = (key) => key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) {
      args._.push(item);
      continue;
    }

    const [rawKey, inlineValue] = item.slice(2).split('=');
    const key = normalizeKey(rawKey);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function getRepoRoot() {
  return resolve(__dirname, '..', '..');
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function assertWritableTarget(targetDir, force) {
  if (!existsSync(targetDir)) {
    return;
  }

  const files = readdirSync(targetDir).filter((file) => !['.gitkeep', '.DS_Store'].includes(file));
  if (files.length && !force) {
    throw new Error(`${targetDir} is not empty. Use --force to copy anyway.`);
  }
}

function copyDirectory(sourceDir, targetDir) {
  ensureDir(targetDir);
  readdirSync(sourceDir).forEach((file) => {
    if (SKIP_DIRS.has(file)) {
      return;
    }

    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);
    const stat = lstatSync(sourcePath);
    if (stat.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      return;
    }

    if (stat.isSymbolicLink()) {
      return;
    }

    copyFileSync(sourcePath, targetPath);
  });
}

function getTemplate(template) {
  const normalized = template || 'manager';
  const match = Object.entries(PLAYGROUND_TEMPLATES).find(
    ([key, item]) => key === normalized || item.label === normalized || item.sources.includes(normalized)
  );
  if (!match) {
    throw new Error(`Unknown template: ${template}`);
  }
  return match;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceInFile(filePath, replacements) {
  if (!existsSync(filePath)) {
    return false;
  }

  let content = readFileSync(filePath, 'utf8');
  const before = content;
  replacements.forEach(([search, replace]) => {
    content = content.replace(search instanceof RegExp ? search : new RegExp(escapeRegExp(search), 'g'), replace);
  });

  if (content !== before) {
    writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function getMysqlUrl(config) {
  const user = config.mysql_user || 'root';
  const password = config.mysql_pwd || 'root';
  const host = config.mysql_host || 'localhost';
  const port = config.mysql_port || '3306';
  const database = config.database || 'test_base';
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
}

function normalizeHost(value) {
  return String(value || 'localhost:8001').replace(/^https?:\/\//, '');
}

function applyPlaygroundConfig(projectDir, sources, config = {}) {
  const serverHost = normalizeHost(config.client_api);
  const serverUrl = `http://${serverHost}`;
  const sourcemapUrl = `http://${serverHost}/sourcemap/upload`;
  const mysqlUrl = getMysqlUrl(config);
  const rabbitHost = config.rabbit_host || 'localhost';
  const projectName = config.name || basename(projectDir);
  const changed = [];

  const replacementsByFile = [
    {
      file: join(projectDir, 'schema.prisma'),
      replacements: [[/mysql:\/\/[^"\r\n]+/g, mysqlUrl]]
    },
    {
      file: join(projectDir, 'src', 'views', 'demo.html'),
      replacements: [
        [/host:\s*['"][^'"]+['"]/g, `host: '${serverHost}'`],
        [/http:\/\/localhost:8001\/browser-sync\/socket\.io/g, `http://${serverHost}/browser-sync/socket.io`]
      ]
    },
    {
      file: join(projectDir, 'src', 'controller', 'projCtrl.ts'),
      replacements: [[/new Rabbit\(['"][^'"]+['"]\)/g, `new Rabbit('${rabbitHost}')`]]
    },
    {
      file: join(projectDir, 'src', 'controller', 'logCtrl.ts'),
      replacements: [[/new Rabbit\(['"][^'"]+['"]\)/g, `new Rabbit('${rabbitHost}')`]]
    },
    {
      file: join(projectDir, 'vite.config.ts'),
      replacements: [
        [/target:\s*['"]http:\/\/[^'"]+['"]/g, `target: 'http://${serverHost}'`],
        [/const BASE_URL = ['"]http:\/\/[^'"]+['"]/g, `const BASE_URL = '${serverUrl}'`],
        [/url:\s*`http:\/\/[^`]+\/sourcemap\/upload`/g, `url: \`${sourcemapUrl}\``]
      ]
    },
    {
      file: join(projectDir, 'src', 'main.tsx'),
      replacements: [[/host:\s*['"][^'"]+['"]/g, `host: '${serverHost}'`]]
    },
    {
      file: join(projectDir, 'index.html'),
      replacements: [[/<title>[^<]*<\/title>/g, `<title>${projectName}</title>`]]
    }
  ];

  sources.forEach((source) => {
    const baseDir = sources.length > 1 ? join(projectDir, source) : projectDir;

    if (source === 'manager') {
      const envDevPath = join(baseDir, '.env.development');
      if (replaceInFile(envDevPath, [[/VITE_API_URL=.*/g, `VITE_API_URL='//${serverHost}'`]])) {
        changed.push(envDevPath);
      }
      const envProdPath = join(baseDir, '.env.production');
      if (replaceInFile(envProdPath, [[/VITE_API_URL=.*/g, `VITE_API_URL='//${serverHost}'`]])) {
        changed.push(envProdPath);
      }
    }

    replacementsByFile.forEach(({ file, replacements }) => {
      const target = sources.length > 1 ? file.replace(projectDir, baseDir) : file;
      if (replaceInFile(target, replacements)) {
        changed.push(target);
      }
    });

    const pkgPath = join(baseDir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      let pkgChanged = false;

      if (config.name) {
        pkg.name = projectName;
        pkgChanged = true;
      }
      if (config.version) {
        pkg.version = config.version;
        pkgChanged = true;
      }
      if (config.description) {
        pkg.description = config.description;
        pkgChanged = true;
      }
      if (config.author) {
        pkg.author = config.author;
        pkgChanged = true;
      }

      if (pkgChanged) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        changed.push(pkgPath);
      }
    }
  });

  return changed;
}

function copyPlaygroundTemplate(options) {
  const { template, name, cwd = process.cwd(), force = false, repoRoot = getRepoRoot(), config = {} } = options;
  const [, selected] = getTemplate(template);
  const projectName = name || selected.defaultName;
  const projectDir = resolve(cwd, projectName);

  assertWritableTarget(projectDir, force);
  ensureDir(projectDir);

  selected.sources.forEach((source) => {
    const sourceDir = join(repoRoot, 'playground', source);
    if (!existsSync(sourceDir)) {
      throw new Error(`Playground source does not exist: ${sourceDir}`);
    }

    const targetDir = selected.sources.length > 1 ? join(projectDir, source) : projectDir;
    copyDirectory(sourceDir, targetDir);
  });

  const changedFiles = applyPlaygroundConfig(projectDir, selected.sources, config);

  return {
    projectDir,
    projectName,
    sources: selected.sources,
    changedFiles
  };
}

function pickCliConfig(args) {
  const config = {};
  if (args.clientApi || args.client_api) config.client_api = args.clientApi || args.client_api;
  if (args.database) config.database = args.database;
  if (args.mysqlHost || args.mysql_host) config.mysql_host = args.mysqlHost || args.mysql_host;
  if (args.mysqlPort || args.mysql_port) config.mysql_port = args.mysqlPort || args.mysql_port;
  if (args.mysqlUser || args.mysql_user) config.mysql_user = args.mysqlUser || args.mysql_user;
  if (args.mysqlPassword || args.mysqlPwd || args.mysql_pwd) config.mysql_pwd = args.mysqlPassword || args.mysqlPwd || args.mysql_pwd;
  if (args.rabbitHost || args.rabbit_host) config.rabbit_host = args.rabbitHost || args.rabbit_host;
  return config;
}

async function promptCreate(args) {
  const templateChoices = Object.entries(PLAYGROUND_TEMPLATES).map(([value, item]) => ({
    name: item.label,
    value
  }));
  const base = args.template
    ? { template: args.template }
    : await prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Please select a playground project:',
          choices: templateChoices,
          default: 'manager'
        }
      ]);

  const [, selected] = getTemplate(base.template);

  const nameAnswer = args.name
    ? { name: args.name }
    : await prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name?',
          default: selected.defaultName
        }
      ]);

  const baseAnswers = args.yes ? {} : await prompt(BASE_QS);
  const configAnswers = args.yes ? {} : await prompt(selected.questions);

  const result = copyPlaygroundTemplate({
    template: base.template,
    name: nameAnswer.name,
    force: Boolean(args.force),
    config: {
      name: nameAnswer.name,
      ...baseAnswers,
      ...configAnswers,
      ...pickCliConfig(args)
    }
  });

  process.stdout.write(
    successBox(
      [`cd ${result.projectName}`, 'npm install', 'npm run dev', '', `Configured files: ${result.changedFiles.length}`].join('\n'),
      `${result.projectName} created from playground`
    )
  );
}

function printHelp() {
  process.stdout.write(
    infoBox(
      [
        'Commands:',
        '  heimdallr create [options]    Create a playground project',
        '',
        'Create options:',
        '  --template manager|server|server-rabbitmq|mock-app',
        '  --name <dir>',
        '  --force (overwrite existing directory)',
        '',
        'Config flags (for create):',
        '  --client-api <host:port>',
        '  --database <name> --mysql-host <host> --mysql-port <port>',
        '  --mysql-user <user> --mysql-password <password>',
        '  --rabbit-host <host>',
        '',
        'The legacy heimdallr-create binary still runs create.'
      ].join('\n'),
      'Heimdallr CLI'
    )
  );
}

async function run(argv = process.argv.slice(2), binName = basename(process.argv[1] || 'heimdallr')) {
  const parsed = parseArgs(argv);
  const command = binName === 'heimdallr-create' && !parsed._[0] ? 'create' : parsed._[0] || 'create';

  try {
    if (command === 'help' || command === '--help' || command === '-h') {
      printHelp();
      return 0;
    }
    if (command === 'create') {
      await promptCreate(parsed);
      return 0;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    process.stdout.write(errorBox(error.message || error, 'Command failed'));
    return 1;
  }
}

if (require.main === module) {
  run().then((code) => {
    process.exitCode = code;
  });
}

module.exports = {
  PLAYGROUND_TEMPLATES,
  applyPlaygroundConfig,
  copyDirectory,
  copyPlaygroundTemplate,
  getMysqlUrl,
  parseArgs,
  replaceInFile
};
