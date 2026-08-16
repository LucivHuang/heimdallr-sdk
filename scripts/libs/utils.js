const PKG_OPTIONS = [
  {
    label: '客户端',
    value: 'clients'
  },
  { label: '监控后台', value: 'playground' },
  { label: '文档', value: 'docs' }
];
const TOOLS = [{ label: '工具', value: 'tools' }];

/** 无需构建的项目 */
const IGNORES = ['cli'];

/**
 * 根据执行模式返回选项
 * @param {string} mode 
 * @returns 
 */
const getPkgOptsByMode = (mode) => {
  switch (mode) {
    case 'development':
      return PKG_OPTIONS.map(({ label }) => label);
    case 'production':
      return [...PKG_OPTIONS, ...TOOLS].map(({ label }) => label);
    default:
      return [];
  }
};

/**
 * 根据回答查找目录
 * @param {string} type 
 * @returns 
 */
const getDirByType = (type) => {
  const total = [...PKG_OPTIONS, ...TOOLS];
  const target = total.find(({ label }) => label === type);
  if (target) {
    return target.value;
  }
  return '';
};

const isBelongLibs = (file) => /^libs\//.test(file);

const isBelongCli = (file) => /^clients\//.test(file);

const isBelongBrowserPlugins = (file) => /^browser_plugins\//.test(file);

const isBelongWxPlugins = (file) => /^wx_plugins\//.test(file);

const isBelongTools = (file) => /^tools\//.test(file);

const isBelongPlayground = (file) => /^playground\//.test(file);

const isBelongDocs = (file) => /^docs\//.test(file);

const SCOPE_ROOTS = ['libs', 'clients', 'browser_plugins', 'wx_plugins', 'tools', 'playground'];

const normalizeFilePath = (file) => file.replace(/\\/g, '/');

const getCommitScope = (file) => {
  const normalizedFile = normalizeFilePath(file);
  const parts = normalizedFile.split('/').filter(Boolean);

  if (parts[0] === 'docs') {
    return 'docs';
  }

  if (SCOPE_ROOTS.includes(parts[0]) && parts[1]) {
    return parts[1];
  }

  return 'sdk';
};

const getCommitPackageDir = (file) => {
  const normalizedFile = normalizeFilePath(file);
  const parts = normalizedFile.split('/').filter(Boolean);

  if (parts[0] === 'docs') {
    return 'docs';
  }

  if (SCOPE_ROOTS.includes(parts[0]) && parts[1]) {
    return `${parts[0]}/${parts[1]}`;
  }

  return '.';
};

const groupFilesByCommitScope = (files) =>
  files.reduce((scopes, file) => {
    const scope = getCommitScope(file);

    if (!scopes[scope]) {
      scopes[scope] = [];
    }

    scopes[scope].push(file);
    return scopes;
  }, {});

module.exports = {
  IGNORES,
  getPkgOptsByMode,
  getDirByType,
  getCommitScope,
  getCommitPackageDir,
  groupFilesByCommitScope,
  isBelongLibs,
  isBelongCli,
  isBelongBrowserPlugins,
  isBelongWxPlugins,
  isBelongTools,
  isBelongPlayground,
  isBelongDocs,
};
