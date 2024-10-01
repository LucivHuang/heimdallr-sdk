/**
 * 返回包含id、class、innerTextde字符串的标签
 * @param target html节点
 */
export function htmlElementAsString(target: HTMLElement): string {
  if (!target) {
    return null;
  }
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'body') {
    return null;
  }
  let classNames = target.classList.value;
  classNames = classNames !== '' ? ` class="${classNames}"` : '';
  const id = target.id ? ` id="${target.id}"` : '';
  const innerText = target.innerText;
  return `<${tagName}${id}${classNames !== '' ? classNames : ''}>${innerText}</${tagName}>`;
}
