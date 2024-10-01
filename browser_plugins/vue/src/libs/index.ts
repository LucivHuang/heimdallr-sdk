
/**
 * 解析错误堆栈
 * @param stack 
 * @returns 
 */
export const parseStack = (stack: string) => {
  if (!stack) {
    return {};
  }
  const REG_EXP = /([a-z|0-9|-]*).js:[0-9]*:[0-9]*/;
  const [, sourceFile] = stack.split('\n');
  const [matched = ''] = REG_EXP.exec(sourceFile) || [];
  const [fileName, lineCol = ''] = matched.split('.js:');
  const [line, col] = lineCol.split(':');
  const lineno = Number(line);
  const colno = Number(col);
  if (!fileName || lineno !== lineno || colno !== colno) {
    return {};
  }
  return {
    lineno,
    colno,
    filename: `${fileName}.js`
  };
}
