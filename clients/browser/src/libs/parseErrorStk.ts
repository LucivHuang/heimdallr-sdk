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
 * 解析行
 * @param line
 * @returns
 */
export const parseStackLine = (line: string) => {
  const lineMatch = line.match(FULL_MATCH);
  if (!lineMatch) return {};
  const filename = lineMatch[2];
  const functionName = lineMatch[1] || '';
  const lineno = parseInt(lineMatch[3], 10) || undefined;
  const colno = parseInt(lineMatch[4], 10) || undefined;
  return {
    filename,
    functionName,
    lineno,
    colno
  };
};

/**
 * 解析错误堆栈
 * @param error
 * @returns
 */
export const parseStackFrames = (error: Error, limit = 3) => {
  const { stack } = error;
  // 无 stack 时直接返回
  if (!stack) return [];
  const frames: FrameType[] = [];
  for (const line of stack.split('\n').slice(1)) {
    const frame = parseStackLine(line);
    if (frame) {
      frames.push(frame);
    }
  }
  return frames.slice(0, limit);
};
