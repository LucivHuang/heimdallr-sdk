import TrySourceMap, { SourcemapReturnType } from '../lib/sourcemap';

/**
 * 查找源文件位置
 * @param req
 * @param res
 */
export function search(req, res) {
  const query = { ...req.query };
  const { lineno: line, colno: col, filename, app_name } = query;
  if (!line || !col) {
    res.send({ ret: -1, msg: 'missing lineno or colno' });
    return;
  }
  if (!filename || !app_name) {
    res.send({ ret: -1, msg: 'missing filename or app_name' });
    return;
  }
  let sourceMap = new TrySourceMap({
    lineno: Number(line),
    colno: Number(col),
    folder: app_name,
    filename
  });
  sourceMap.find().then((response: SourcemapReturnType) => {
    const { data, msg } = response;
    res.send({
      code: 0,
      msg,
      data
    });
  });
}
