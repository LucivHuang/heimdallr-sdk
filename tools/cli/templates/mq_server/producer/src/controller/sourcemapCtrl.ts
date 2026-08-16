import path from 'path';
import fs from 'fs';
/**
 * 接收上传文件
 * @param req
 * @param res
 */
export function upload(req, res) {
  const sourceMapDir = path.join(__dirname, '../', 'tempSourceMap');
  if (!fs.existsSync(sourceMapDir)) {
    fs.mkdirSync(sourceMapDir);
  }
  try {
    const { fields = {}, files = {} } = req;
    const { dirname = 'unknown', filename = 'unknown' } = fields;
    const { file } = files;
    if (!file) {
      throw new Error('请上传文件');
    }
    const dirnameNew = path.resolve(sourceMapDir, dirname);
    if (!fs.existsSync(dirnameNew)) {
      fs.mkdirSync(dirnameNew);
    }
    const rs = fs.createReadStream(file.path);
    const ws = fs.createWriteStream(path.join(dirnameNew, filename));
    rs.pipe(ws);
    rs.on('end', function () {
      res.send({ code: 0, msg: 'success' });
    });
  } catch (error) {
    res.send({ code: -1, msg: error.message || JSON.stringify(error) });
  }
}
