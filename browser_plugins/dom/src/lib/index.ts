/**
 * 返回包含id、class、innerText字符串的标签
 * @param target html节点
 * @param classes 敏感词类名
 * @param tags 敏感词标签
 */
export function htmlElementAsString(target: HTMLElement, classes: string[] = [], tags: string[] = []) {
  const { localName, classList, id, innerText } = target;
  if (localName === 'body') {
    return null;
  }
  const classNames = classList.value;
  let isSensitive = false;
  const trimTags = tags.map((tag) => tag.trim());
  if (trimTags.includes(localName)) {
    isSensitive = true;
  }
  if (!isSensitive && classes.length) {
    const trimClasses = classes.map((item) => item.trim());
    for (const className of trimClasses) {
      if (className.includes(' ')) {
        /* 带层级选择器，全局查找元素 */
        const elements = Array.from(document.querySelectorAll(className));
        if (elements.includes(target)) {
          isSensitive = true;
          break;
        }
        continue;
      }
      /** 直接匹配 */
      if (classNames.includes(className)) {
        isSensitive = true;
        break;
      }
    }
  }
  const idStr = id ? ` id="${id}"` : '';
  return `<${localName}${idStr}${classNames ? ` class="${classNames}"` : ''}>${isSensitive ? '[敏感数据]' : innerText}</${localName}>`;
}
