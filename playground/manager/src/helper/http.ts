import axios, { AxiosStatic } from "axios";
import { ElMessage } from "element-plus";
import { stringify } from "qs";
import { router } from "@/route";
import { USER_TOKEN_KEY } from "./config/others";
import { getCookie } from "./utils";

export declare interface Http extends AxiosStatic {
  jsonp?: Function;
}

const http: Http = axios;

// 拦截返回值所需配置
// 服务器 code
const CODE_ENUM = {
  SUCCESS: 0, // 成功
  TOKEN_EXPIRED: "060206", // 登录超时
};
// 服务器返回码字段
const SERVER_FIELD = {
  CODE: "code",
  DATA: "data",
  MESSAGE: "msg",
};
// 登录页（缺少token时跳转）
const LOGIN_PATH = "/login";

// 添加 jsonp 请求
http.jsonp = (url: string, config?) => {
  const { timeout = 5000 } = config;
  const callbackName = `_jsp${new Date().getTime()}${Math.round(
    Math.random() * 1000
  )}`;
  return new Promise((resolve, reject) => {
    const JSONP = document.createElement("script");
    JSONP.type = "text/javascript";
    JSONP.src = `${url}&callback=${callbackName}`;
    document.getElementsByTagName("head")[0].appendChild(JSONP);

    window[callbackName] = (body) => resolve({ data: body || {}, status: 200 });
    setTimeout(() => {
      document.getElementsByTagName("head")[0].removeChild(JSONP);
    }, 500);
    setTimeout(() => {
      reject("request timeout");
    }, timeout);
  });
};

http.defaults.baseURL = import.meta.env.VITE_API_URL;

// 设置 post 请求头
http.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

// 添加请求拦截器
http.interceptors.request.use((config) => {
  const { method, data } = config;
  if (method === 'post') {
    config.data = stringify(data);
  }
  // 若存在则添加 jwt
  const token = getCookie(USER_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    const { data } = response;
    const code = data[SERVER_FIELD.CODE];
    if (code === CODE_ENUM.SUCCESS) {
      return data[SERVER_FIELD.DATA];
    } else if (code === CODE_ENUM.TOKEN_EXPIRED) {
      ElMessage.warning("登录凭证已失效，请重新登录");
      router.push(LOGIN_PATH);
    } else {
      const errMsg = data[SERVER_FIELD.MESSAGE];
      ElMessage.error(`请求失败${errMsg ? `，${errMsg}` : ""}`);
      return Promise.reject(errMsg);
    }
  },
  (error) => {
    ElMessage.error("服务器异常，请稍后再试");
    return Promise.reject(error);
  }
);

export default http;
