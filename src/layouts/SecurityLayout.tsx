import React from 'react';
import type { ConnectProps } from 'umi';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';
import { PageLoading } from '@ant-design/pro-layout';
import { getCookieJSON } from '@/utils/utils';
import type { ConnectState } from '@/models/connect';
import type { CurrentUser } from '@/models/user';

type SecurityLayoutProps = {
  loading?: boolean;
  currentUser?: CurrentUser;
} & ConnectProps;

type SecurityLayoutState = {
  isReady: boolean;
};

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }

  render() {
    const { isReady } = this.state;
    // const { children, loading, currentUser } = this.props;
    const { children, loading } = this.props;
    // You can replace it to your authentication rule (such as check token exists)
    // You can replace it with your own login authentication rules (such as judging whether the token exists)
    const currentUser = getCookieJSON('userInfoFake');
    const isLogin = currentUser && currentUser.userid;
    const queryString = stringify({
      redirect: window.location.href,
    });

    // console.log(
    //   'auth',
    //   isReady, // true
    //   children,
    //   loading, // false
    //   currentUser,
    //   queryString, // redirect=http%3A%2F%2Flocalhost%3A8000%2Fwelcome
    //   window.location.pathname, // /welcome
    // );

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }
    if (!isLogin && window.location.pathname !== '/user/login') {
      return <Redirect to={`/user/login?${queryString}`} />;
    }
    return children;
  }
}

export default connect(({ user, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))(SecurityLayout);
