import { LockOutlined, MailOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useIntl, connect } from 'umi';
import type { Dispatch } from 'umi';
import type { StateType } from '@/models/login';
import type { ConnectState } from '@/models/connect';

import styles from './index.less';

export type LoginProps = {
  dispatch: Dispatch;
  userLogin: StateType;
  submitting?: boolean;
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

// 新增：注册失败提示组件
const RegisterMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC<LoginProps> = (props) => {
  const { userLogin = {}, submitting } = props;

  const intl = useIntl();
  const { status, type: loginType, registerStatus } = userLogin;
  const [type, setType] = useState<string>('realAccount');

  // 移除 loginForm 和 registerForm 的 useState

  // ===================== 真实登录提交 =====================
  const handleRealLogin = async (values: any) => {
    const { dispatch } = props;
    // 1. 表单非空校验
    if (!values.userName || !values.passWord) {
      message.error(
        intl.formatMessage({
          id: 'login.login.alert.msg.not.empty',
          defaultMessage: '账号或密码不能为空！',
        }),
      );
      return;
    }
    // 2. 调用真实登录
    dispatch({
      type: 'login/realLogin',
      payload: {
        ...values,
        validityTime: 60 * 60 * 24,
        autoLogin: true,
        isFromCookie: false,
      },
    });
  };

  // ===================== 注册提交 =====================
  const handleRegister = async (values: any) => {
    const { dispatch } = props;
    // 1. 表单非空校验
    if (
      !values.userName ||
      !values.passWord ||
      !values.confimPassWord ||
      !values.email ||
      !values.phone
    ) {
      message.error(
        intl.formatMessage({
          id: 'login.register.alert.msg.not.empty',
          defaultMessage: '注册信息均不能为空！',
        }),
      );
      return;
    }
    // 2. 密码一致性校验
    if (values.passWord !== values.confimPassWord) {
      message.error(
        intl.formatMessage({
          id: 'login.login.alert.msg.not.same',
          defaultMessage: '两次输入的密码不一致！',
        }),
      );
      return;
    }
    // 3. 调用注册接口
    dispatch({
      type: 'login/realSignup',
      payload: {
        ...values,
        level: 16,
      },
    }).then((res: any) => {
      if (res) {
        setType('realAccount');
      }
    });
  };

  return (
    <div className={styles.main}>
      {/* ===================== 仅展示真实登录/注册 Tab ===================== */}
      <Tabs activeKey={type} onChange={setType}>
        <Tabs.TabPane
          key="realAccount"
          tab={intl.formatMessage({
            id: 'login.title.login.account.password',
            defaultMessage: '账号密码登录',
          })}
        />
        <Tabs.TabPane
          key="register"
          tab={intl.formatMessage({
            id: 'login.title.register.account',
            defaultMessage: '注册账号',
          })}
        />
      </Tabs>

      {/* 登录表单 */}
      {type === 'realAccount' && (
        <ProForm
          initialValues={{
            userName: '',
            passWord: '',
            autoLogin: true,
          }}
          submitter={{
            render: (_, dom) => dom.pop(),
            submitButtonProps: {
              loading: submitting && loginType === 'realAccount',
              size: 'large',
              style: {
                width: '100%',
              },
            },
          }}
          onFinish={handleRealLogin}
        >
          {/* 真实登录失败提示 */}
          {status === 'error' && loginType === 'realAccount' && !submitting && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'login.msg.fail.check.login.info',
                defaultMessage: '登录失败！请检查登录信息~',
              })}
            />
          )}
          <ProFormText
            name="userName"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.user',
              defaultMessage: '请输入用户名',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.user',
                  defaultMessage: '请输入用户名',
                })}!`,
              },
            ]}
          />
          <ProFormText.Password
            name="passWord"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.password',
              defaultMessage: '请输入密码',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.password',
                  defaultMessage: '请输入密码',
                })}!`,
              },
            ]}
          />
        </ProForm>
      )}

      {/* 注册表单 */}
      {type === 'register' && (
        <ProForm
          initialValues={{
            userName: '',
            passWord: '',
            confimPassWord: '',
            email: '',
            phone: '',
          }}
          submitter={{
            render: (_, dom) => dom.pop(),
            submitButtonProps: {
              loading: submitting && loginType === 'register',
              size: 'large',
              style: {
                width: '100%',
              },
            },
          }}
          onFinish={handleRegister}
        >
          {/* 注册失败提示 */}
          {registerStatus === 'error' && !submitting && (
            <RegisterMessage
              content={intl.formatMessage({
                id: 'ogin.msg.fail.check.register.info',
                defaultMessage: '注册失败！请检查注册信息~',
              })}
            />
          )}
          <ProFormText
            name="userName"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.user',
              defaultMessage: '请输入用户名',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.user',
                  defaultMessage: '请输入用户名',
                })}!`,
              },
            ]}
          />
          <ProFormText.Password
            name="passWord"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.password',
              defaultMessage: '请输入密码',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.password',
                  defaultMessage: '请输入密码',
                })}!`,
              },
            ]}
          />
          <ProFormText.Password
            name="confimPassWord"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.check.password',
              defaultMessage: '请确认密码',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.check.password',
                  defaultMessage: '请确认密码',
                })}!`,
              },
            ]}
          />
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <MailOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.email',
              defaultMessage: '请输入邮箱',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.email',
                  defaultMessage: '请输入邮箱',
                })}!`,
              },
              {
                type: 'email',
                message: intl.formatMessage({
                  id: 'login.form.msg.alert.right.email',
                  defaultMessage: '请输入正确的邮箱格式！',
                }),
              },
            ]}
          />
          <ProFormText
            name="phone"
            fieldProps={{
              size: 'large',
              prefix: <MobileOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'login.form.msg.enter.phone',
              defaultMessage: '请输入手机号',
            })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'login.form.msg.enter.phone',
                  defaultMessage: '请输入手机号',
                })}!`,
              },
              {
                pattern: /^1\d{10}$/,
                message: intl.formatMessage({
                  id: 'login.form.msg.alert.right.phone',
                  defaultMessage: '请输入正确的手机号格式！',
                }),
              },
            ]}
          />
        </ProForm>
      )}
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/realLogin'] || loading.effects['login/realSignup'], // 仅监听真实登录/注册的加载状态
}))(Login);
