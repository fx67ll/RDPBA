import { stringify } from 'querystring';
import type { Reducer, Effect } from 'umi';
import { history } from 'umi';
import type { SagaIterator } from 'redux-saga';
import { message } from 'antd';
import Cookies from 'js-cookie';

// 新增：导入真实登录/注册接口
import { fakeAccountLogin, login as realLogin, signup as realSignup } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { userInfoFake } from '../../mock/userData';

export type StateType = {
  status?: 'ok' | 'error';
  type?: string;
  token?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
  registerStatus?: 'ok' | 'error';
};

export type LoginModelType = {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect; // 原有 Mock 登录（保留，注释标记）
    realLogin: Effect; // 新增：真实登录
    setLoginConfig: Effect; // 新增：登录配置（记住密码）写入
    realSignup: Effect; // 新增：真实注册
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
    changeRegisterStatus: Reducer<StateType>; // 新增：注册状态更新
  };
};

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
    registerStatus: undefined, // 新增：注册状态初始化
  },

  effects: {
    // ===================== 原有 Mock 登录逻辑（保留，注释标记） =====================
    *login({ payload }, { call, put }): SagaIterator {
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.status === 'ok') {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('🎉 🎉 🎉  登录成功！');
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (window.routerBase !== '/') {
              redirect = redirect.replace(window.routerBase, '/');
            }
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        history.replace(redirect || '/');
      }
    },

    // ===================== 新增：真实登录逻辑（对齐 Mock 登录成功逻辑） =====================
    *realLogin({ payload }, { call, put }): SagaIterator {
      const response = yield call(realLogin, payload);

      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: response.status === 0 ? 'ok' : 'error',
          type: 'account',
          currentAuthority: 'admin', // or user
        },
      });

      // yield put({
      //   type: 'user/saveCurrentUser', // 格式：namespace/reducer名称
      //   payload: userInfoFake, // 传递用户信息给 saveCurrentUser，SecurityLayout中会检查currerntUser对象的信息
      // });

      // 仅登录成功时写入登录态 Cookie，提示与跳转由登录页面控制（登录配置弹窗需要拦截跳转时机）
      if (response.status === 0) {
        // js-cookie 的 expires 单位为「天」，validityTime 单位为「秒」，换算与 Vue 版保持一致
        const expires = (payload.validityTime || 60 * 60 * 24) / (60 * 60 * 24);
        // 登录态 Cookie 必须与 token 设置相同的有效期，否则登录状态永不过期
        Cookies.set('userInfoFake', JSON.stringify(userInfoFake), {
          expires,
          path: '/',
        });
        Cookies.set('User-Token', response.token, {
          expires,
          // path 必须是 URL 路径（如 '/'），不能是完整地址，
          // 否则 Cookie 在任何页面都不可见，请求永远带不上 token
          path: '/',
        });
      }

      return response;
    },

    // ===================== 新增：登录配置弹窗确认后写入记住密码相关 Cookie =====================
    *setLoginConfig({ payload }): SagaIterator {
      const { token, userName, passWord, validityTime, isRememberMe } = payload;
      // js-cookie 的 expires 单位为「天」，validityTime 单位为「秒」
      const expires = (validityTime || 60 * 60 * 24) / (60 * 60 * 24);

      if (isRememberMe) {
        // 按选择的有效期重新设置登录态 Cookie 与 token，并记录账号密码信息
        Cookies.set('userInfoFake', JSON.stringify(userInfoFake), {
          expires,
          path: '/',
        });
        Cookies.set('User-Token', token, {
          expires,
          path: '/',
        });
        Cookies.set('rememberMe', 'true', {
          expires,
          path: '/',
        });
        Cookies.set(
          'Login-Info',
          JSON.stringify({
            userName,
            passWord,
            validityTime,
            isFromCookie: true,
          }),
          {
            expires,
            path: '/',
          },
        );
      } else {
        // 不记住密码则清除历史登录配置
        Cookies.remove('rememberMe', { path: '/' });
        Cookies.remove('Login-Info', { path: '/' });
      }
    },

    // ===================== 新增：真实注册逻辑 =====================
    *realSignup({ payload }, { call, put }): SagaIterator {
      const response = yield call(realSignup, payload);
      yield put({
        type: 'changeRegisterStatus',
        payload: {
          registerStatus: response.status === 0 ? 'ok' : 'error',
        },
      });

      // 注册成功/失败提示
      if (response.status === 0) {
        message.success('注册成功！请登录~');
      } else {
        message.error(`注册失败！${response?.msg}`);
      }

      return response.status === 0;
    },

    // 退出登录逻辑：清空登录态与登录配置后跳转登录页
    logout() {
      // 主动退出时清空全部登录相关 Cookie，保证下次登录会重新弹出登录配置弹窗
      Cookies.remove('User-Token', { path: '/' });
      Cookies.remove('userInfoFake', { path: '/' });
      Cookies.remove('rememberMe', { path: '/' });
      Cookies.remove('Login-Info', { path: '/' });

      const { redirect } = getPageQuery();
      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },

  reducers: {
    // 原有登录状态更新（保留）
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },

    // 新增：注册状态更新
    changeRegisterStatus(state, { payload }) {
      return {
        ...state,
        registerStatus: payload.registerStatus,
      };
    },
  },
};

export default Model;
