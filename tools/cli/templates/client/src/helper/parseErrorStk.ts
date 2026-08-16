/** 正则表达式，用以解析堆栈split后得到的字符串 */
const FULL_MATCH =
  /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

type FrameType = {
  lineno?: number;
  colno?: number;
  filename?: string;
  functionName?: string;
};

/**
 * 提取文件名
 * @param fullPath 完整的路径
 * @returns 文件名
 */
const extractFilename = (fullPath: string): string => {
  try {
    return fullPath.split('/').pop() || fullPath;
  } catch {
    return fullPath;
  }
};

/**
 * 解析单行堆栈
 * @param line 堆栈行
 * @returns 解析后的堆栈信息
 */
export const parseStackLine = (line: string): FrameType => {
  const lineMatch = line.match(FULL_MATCH);
  if (!lineMatch) return {};
  const fullPath = lineMatch[2];
  const functionName = lineMatch[1] || '';
  const lineno = parseInt(lineMatch[3], 10) || undefined;
  const colno = parseInt(lineMatch[4], 10) || undefined;
  return {
    filename: extractFilename(fullPath),
    functionName,
    lineno,
    colno
  };
};

/**
 * 解析错误堆栈
 * @param stack 错误堆栈字符串
 * @param limit 返回的最大帧数
 * @returns 解析后的堆栈信息数组
 */
export const parseStackFrames = (stack: string, limit = 3): FrameType[] => {
  if (!stack) return [];
  const lines = stack.split('\n').slice(1);
  return lines.map(parseStackLine).filter(frame => Object.keys(frame).length > 0).slice(0, limit);
};
