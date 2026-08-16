import { parseValueByPath } from "helper/utils";
import http from "helper/http";
import { TranslateConfig } from "..";

declare interface RmoteParam extends TranslateConfig {
  prop: string;
}

export default function useTranslate() {
  // 异步翻译
  const cache = {};
  function remoteTranslate(config: RmoteParam, row) {
    const { prop, url, dataPath, dataKey } = config;
    const value = row[prop];
    if (value) {
      if (cache[`${value}`]) {
        row[prop] = cache[`${value}`];
      } else {
        http
          .get(`${url}${value}`)
          .then((res) => {
            const datas = parseValueByPath(res, dataPath);
            const result = Array.isArray(datas)
              ? datas[0][dataKey]
              : datas[dataKey];
            cache[`${value}`] = result;
            row[prop] = result;
          })
          .catch(() => {});
      }
    }
  }
  return {
    remoteTranslate,
  };
}
