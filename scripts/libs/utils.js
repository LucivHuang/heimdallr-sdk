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

module.exports = {
  IGNORES,
  getPkgOptsByMode,
  getDirByType,
};
