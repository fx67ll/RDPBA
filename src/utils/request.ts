/**
 * Request 网络请求工具
 * 基于 umi-request 封装，完全兼容 Vue 版本业务逻辑
 * 文档: https://github.com/umijs/umi-request
 */
import type { RequestInterceptor, RequestOptionsInit } from 'umi-request';
import { extend } from 'umi-request';
import { notification, message } from 'antd';
import Cookies from 'js-cookie';

/**
 * 异常处理程序（网络错误/超时/HTTP状态码错误）
 * 完全对齐 Vue axios 拦截器：message 轻提示 + Promise.reject
 */
const errorHandler = (error: { response?: Response; message?: string }) => {
  console.error('err', error);
  let { message: errorMsg } = error;

  // 默认文案
  if (!errorMsg) {
    errorMsg = '系统未知错误，请反馈给管理员！';
  }

  // 网络错误 / 超时 / HTTP 状态码错误 文案映射
  if (errorMsg === 'Network Error') {
    errorMsg = '后端接口连接异常';
  } else if (errorMsg.includes('timeout')) {
    errorMsg = '系统接口请求超时';
  } else if (errorMsg.includes('Request failed with status code')) {
    const match = errorMsg.match(/Request failed with status code (\d+)/);
    const statusCode = match ? match[1] : errorMsg.slice(-3);
    errorMsg = `系统接口${statusCode}异常`;
  }

  // ✅ 统一使用 message.error，duration 设为 1 秒（与原 Vue 版 1023ms 对齐）
  message.error(errorMsg, 2);

  // 返回 Promise.reject，与 axios 行为完全一致
  return Promise.reject(error);
};

/**
 * 配置 request 默认参数
 */
const request = extend({
  prefix: process.env.REACT_APP_BASE_API || process.env.UMI_APP_BASE_API || '',
  timeout: 10000,
  errorHandler,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// ---------- 请求拦截器：Token 与 GET 参数序列化 ----------
const requestInterceptor: RequestInterceptor = (url: string, options: RequestOptionsInit) => {
  // 1. Token 处理（兼容 isToken 开关）
  const isToken = (options.headers as any)?.isToken === false;
  const token = Cookies.get('User-Token');
  if (token && !isToken) {
    options.headers = {
      ...options.headers,
      token,
    };
  }

  // 2. GET 请求复杂参数序列化（支持嵌套对象 → a[b]=c）
  if (options.method?.toLowerCase() === 'get' && options.params) {
    let serializedUrl = url + '?';
    const params = options.params as Record<string, any>;

    Object.keys(params).forEach((propName) => {
      const value = params[propName];
      if (value === null || typeof value === 'undefined') return;

      if (typeof value === 'object') {
        Object.keys(value).forEach((key) => {
          const subKey = `${propName}[${key}]`;
          const subValue = value[key];
          if (subValue !== null && typeof subValue !== 'undefined') {
            serializedUrl += `${encodeURIComponent(subKey)}=${encodeURIComponent(subValue)}&`;
          }
        });
      } else {
        serializedUrl += `${encodeURIComponent(propName)}=${encodeURIComponent(value)}&`;
      }
    });

    if (serializedUrl.endsWith('?')) {
      serializedUrl = url;
    } else {
      serializedUrl = serializedUrl.slice(0, -1);
    }

    return {
      url: serializedUrl,
      options: {
        ...options,
        params: {}, // 清空 params，避免重复序列化
      },
    };
  }

  return { url, options };
};

request.interceptors.request.use(requestInterceptor);

// ---------- 响应拦截器：业务状态码处理 ----------
request.interceptors.response.use(async (response: Response) => {
  // 🚨 关键修复：HTTP 错误直接放行，避免重复提示
  if (!response.ok) {
    return response;
  }

  const res = response.clone();
  let data;
  try {
    data = await res.json();
  } catch {
    return response; // 非 JSON 响应原样返回
  }

  const code = data?.status ?? 0;
  const msg = data?.msg || '系统未知错误，请反馈给管理员！';

  // 成功
  if (code === 0) {
    console.log('data', data);
    return data;
  }

  // 401：未认证/未登录
  if (code === 401) {
    notification.warning({
      message: '警告',
      description: msg,
      duration: 2,
    });
    Cookies.remove('User-Token');
    Cookies.remove('userInfoFake');
    setTimeout(() => window.location.reload(), 1023);
    return data;
  }

  // // 400：参数错误
  // if (code === 400) {
  //   let errorMsg = msg;
  //   if (data.error && Array.isArray(data.error) && data.error[0]?.msg) {
  //     errorMsg = `${msg} ${data.error[0].msg}`;
  //   }
  //   notification.error({
  //     message: '错误',
  //     description: errorMsg,
  //     duration: 2,
  //   });
  //   return data;
  // }

  // // 500：服务器错误（此时 HTTP 状态码一定是 2xx，否则已提前返回）
  // if (code === 500) {
  //   message.error(msg, 1);
  //   return Promise.reject(new Error(msg));
  // }

  // // 其他非 0 状态码
  // message.error(msg, 1);
  return Promise.reject(new Error(msg));
});

export default request;