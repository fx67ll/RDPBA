import request from '@/utils/request';
import requestOld from '@/utils/request-mock';
import md5 from 'blueimp-md5'; // 新增 MD5 引入

// 原有 Mock 类型定义（保留，注释标记）
export type FakeLoginParamsType = {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
};

// 原有真实登录类型（保留并对齐 Vue 字段）
export type LoginParamsType = {
  userName: string;
  passWord: string; // 注意 Vue 中是 passWord（首字母大写）
  validityTime: number;
  isFromCookie?: boolean;
  autoLogin?: boolean;
};

// 原有注册类型（保留并对齐 Vue 字段）
export type RegisterFormType = {
  userName: string;
  passWord: string;
  confimPassWord: string; // Vue 中的确认密码字段名（注意拼写：confirm 少了 r，保持和 Vue 一致）
  email: string;
  phone: string;
  level: number;
};

// ===================== 原有 Mock 接口（保留，注释标记） =====================
export async function fakeAccountLogin(params: FakeLoginParamsType) {
  return requestOld('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return requestOld(`/api/login/captcha?mobile=${mobile}`);
}

// ===================== 真实接口（补充加密逻辑） =====================
// 注册（补充 MD5 加密，和 Vue 逻辑对齐）
export async function signup(params: RegisterFormType) {
  // 深拷贝避免修改原参数
  const submitParams = { ...params };
  // 1. 删除确认密码字段（和 Vue 一致，后端不需要）
  delete (submitParams as any).confimPassWord;
  // 2. 密码 MD5 加密（和 Vue 逻辑一致）
  submitParams.passWord = md5(submitParams.passWord);
  // 3. 固定 level 为 16（和 Vue 默认值一致）
  if (!submitParams.level) submitParams.level = 16;

  return request('/express-api/signup', {
    method: 'POST',
    data: submitParams,
  });
}

// 登录（补充 MD5 加密，和 Vue 逻辑对齐）
export async function login(params: LoginParamsType) {
  const submitParams = { ...params };
  // 密码 MD5 加密（Vue 中判断了 isFromCookie，这里简化，统一加密）
  if (!submitParams.isFromCookie) {
    submitParams.passWord = md5(submitParams.passWord);
  }
  // 删除不需要的字段（和 Vue 一致）
  delete submitParams.isFromCookie;

  return request('/express-api/login', {
    method: 'POST',
    data: submitParams,
  });
}
