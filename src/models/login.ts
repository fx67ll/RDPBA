import { stringify } from 'querystring';
import type { Reducer, Effect } from 'umi';
import { history } from 'umi';
import type { SagaIterator } from 'redux-saga';

// 新增：导入真实登录/注册接口
import { fakeAccountLogin, login as realLogin, signup as realSignup } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';

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
          type: 'realAccount',
          currentAuthority: response.status === 0 ? 'user' : 'guest',
        },
      });

      // 登录成功逻辑：完全复用 Mock 登录的 redirect 逻辑
      if (response.status === 0) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('🎉 🎉 🎉  登录成功！'); // 对齐 Mock 的提示文案
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
        history.replace(redirect || '/'); // 对齐 Mock：跳 redirect 或首页，而非 /student
      } else {
        message.error(`登录失败！${response?.msg}`);
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

    // 原有登出逻辑（保留）
    logout() {
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
