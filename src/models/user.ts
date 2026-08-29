import type { Effect, Reducer } from 'umi';
import type { SagaIterator } from 'redux-saga';
// import { queryCurrent, query as queryUsers } from '@/services/user';
import { query as queryUsers } from '@/services/user';
import { checkToken } from '@/services/login';
import { getCookieJSON } from '@/utils/utils';

export type CurrentUser = {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userid?: string;
  unreadCount?: number;
};

export type UserModelState = {
  currentUser?: CurrentUser;
};

export type UserModelType = {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
};

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }): SagaIterator {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }): SagaIterator {
      // *fetchCurrent(_, { call, put }): SagaIterator {
      // const response = yield call(queryCurrent);
      // if (response && response?.userid) {
      //   yield put({
      //     type: 'saveCurrentUser',
      //     payload: response,
      //   });
      // }

      const currentUser = getCookieJSON('userInfoFake');
      if (currentUser && currentUser?.userid) {
        // 页面刷新时主动向服务端校验登录态，避免本地 Cookie 未过期但 token 已失效时误判为已登录
        let isExpired = false;
        try {
          const checkResult = yield call(checkToken);
          isExpired = checkResult?.status === 401;
        } catch (e) {
          // 网络异常等非登录态问题不阻断进入项目
        }
        // 登录过期时 Cookie 已由响应拦截器清除并触发页面刷新，此处不再保存用户信息
        if (isExpired) {
          return;
        }
        yield put({
          type: 'saveCurrentUser',
          payload: currentUser,
        });
      }
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
