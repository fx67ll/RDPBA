import {
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
  // AlipayCircleOutlined,
  // TaobaoCircleOutlined,
  // WeiboCircleOutlined,
} from '@ant-design/icons';
// import { Alert, Space, message, Tabs } from 'antd';
// import React, { useState, useEffect } from 'react';
// import ProForm, { ProFormCaptcha, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
// import { useIntl, connect, FormattedMessage } from 'umi';
// import { getFakeCaptcha } from '@/services/login';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { connect } from 'umi';
import type { Dispatch } from 'umi';
import type { StateType } from '@/models/login';
import type { LoginParamsType, RegisterFormType } from '@/services/login'; // 新增注册类型
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

  // const intl = useIntl();
  const { status, type: loginType, registerStatus } = userLogin;

  // 仅保留真实登录/注册 Tab，Mock 相关 Tab 注释
  const [type, setType] = useState<string>('realAccount');
  const [registerForm, setRegisterForm] = useState<RegisterFormType>({
    // 新增：注册表单状态
    userName: '',
    passWord: '',
    confimPassWord: '', // 和 Vue 保持字段名一致
    email: '',
    phone: '',
    level: 16, // Vue 默认值
  });
  const [loginForm, setLoginForm] = useState<LoginParamsType>({
    // 新增：真实登录表单状态
    userName: '',
    passWord: '',
    validityTime: 60 * 60 * 24, // Vue 默认值
    autoLogin: true,
    isFromCookie: false,
  });

  // ===================== 原有 Mock 登录逻辑（保留，注释标记） =====================
  /*
  const handleFakeLogin = (values: LoginParamsType) => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, type },
    });
  };
  */

  // ===================== 新增：真实登录提交（对齐 Mock 成功逻辑） =====================
  const handleRealLogin = () => {
    const { dispatch } = props;
    // 1. 表单非空校验
    if (!loginForm.userName || !loginForm.passWord) {
      message.error('账号或密码不能为空！');
      return;
    }
    // 2. 调用真实登录
    dispatch({
      type: 'login/realLogin',
      payload: { ...loginForm },
    });
  };

  // ===================== 新增：注册提交 =====================
  const handleRegister = () => {
    const { dispatch } = props;
    // 1. 表单非空校验
    if (
      !registerForm.userName ||
      !registerForm.passWord ||
      !registerForm.confimPassWord ||
      !registerForm.email ||
      !registerForm.phone
    ) {
      message.error('注册信息均不能为空！');
      return;
    }
    // 2. 密码一致性校验
    if (registerForm.passWord !== registerForm.confimPassWord) {
      message.error('两次输入的密码不一致！');
      return;
    }
    // 3. 调用注册接口
    dispatch({
      type: 'login/realSignup',
      payload: { ...registerForm },
    });
    // 4. 注册成功后切回登录 Tab
    if (registerStatus === 'ok') {
      setType('realAccount');
      setLoginForm({
        ...loginForm,
        userName: registerForm.userName,
        passWord: '',
      });
      // 清空注册表单
      setRegisterForm({
        userName: '',
        passWord: '',
        confimPassWord: '',
        email: '',
        phone: '',
        level: 16,
      });
    }
  };

  return (
    <div className={styles.main}>
      <ProForm
        initialValues={{
          autoLogin: true,
        }}
        submitter={{
          render: (_, dom) => dom.pop(), // 隐藏默认提交按钮
          submitButtonProps: {
            loading: submitting,
            size: 'large',
            style: {
              width: '100%',
              display: 'none',
            },
          },
        }}
        onFinish={() => Promise.resolve()}
      >
        {/* ===================== Mock 相关 Tab 注释保留 ===================== */}
        {/*
        <Tabs activeKey={type} onChange={setType}>
          <Tabs.TabPane
            key="account"
            tab={intl.formatMessage({
              id: 'pages.login.accountLogin.tab',
              defaultMessage: 'Mock 账号密码登录',
            })}
          />
          <Tabs.TabPane
            key="mobile"
            tab={intl.formatMessage({
              id: 'pages.login.phoneLogin.tab',
              defaultMessage: 'Mock 手机号验证码登录',
            })}
          />
        */}
        {/* ===================== 仅展示真实登录/注册 Tab ===================== */}
        <Tabs activeKey={type} onChange={setType}>
          <Tabs.TabPane key="realAccount" tab="账号密码登录" />
          <Tabs.TabPane key="register" tab="注册账号" />
        </Tabs>
        {/* ===================== Mock 相关 Tab 结束（注释） ===================== */}
        {/*
        </Tabs>
        */}

        {/* ===================== 原有 Mock 登录表单（注释保留） ===================== */}
        {/*
        {status === 'error' && loginType === 'account' && !submitting && (
          <LoginMessage
            content={intl.formatMessage({
              id: 'pages.login.accountLogin.errorMessage',
              defaultMessage: 'Incorrect account or password（admin/123)',
            })}
          />
        )}
        {type === 'account' && (
          <>
            <ProFormText
              name="userName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.username.placeholder',
                defaultMessage: 'Username: admin or user',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="Please enter user name!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: 'Password: 123',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="Please enter password！"
                    />
                  ),
                },
              ]}
            />
            <button
              className="ant-btn ant-btn-primary ant-btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('form').dispatchEvent(new Event('submit'));
              }}
            >
              Mock 登录
            </button>
          </>
        )}
        {status === 'error' && loginType === 'mobile' && !submitting && (
          <LoginMessage content="Verification code error" />
        )}
        {type === 'mobile' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className={styles.prefixIcon} />,
              }}
              name="mobile"
              placeholder={intl.formatMessage({
                id: 'pages.login.phoneNumber.placeholder',
                defaultMessage: 'Phone number',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.phoneNumber.required"
                      defaultMessage="Please enter phone number!"
                    />
                  ),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: (
                    <FormattedMessage
                      id="pages.login.phoneNumber.invalid"
                      defaultMessage="Malformed phone number!"
                    />
                  ),
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className={styles.prefixIcon} />,
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.captcha.placeholder',
                defaultMessage: 'Please enter verification code',
              })}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${intl.formatMessage({
                    id: 'pages.getCaptchaSecondText',
                    defaultMessage: 'Get verification code',
                  })}`;
                }
                return intl.formatMessage({
                  id: 'pages.login.phoneLogin.getVerificationCode',
                  defaultMessage: 'Get verification code',
                });
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.captcha.required"
                      defaultMessage="Please enter verification code！"
                    />
                  ),
                },
              ]}
              onGetCaptcha={async (mobile) => {
                const result = await getFakeCaptcha(mobile);
                if (result === false) {
                  return;
                }
                message.success(
                  'Get the verification code successfully! The verification code is: 1234',
                );
              }}
            />
            <button
              className="ant-btn ant-btn-primary ant-btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('form').dispatchEvent(new Event('submit'));
              }}
            >
              Mock 手机号登录
            </button>
          </>
        )}
        */}

        {/* ===================== 真实登录表单（仅展示） ===================== */}
        {type === 'realAccount' && (
          <>
            {/* 真实登录失败提示 */}
            {status === 'error' && loginType === 'realAccount' && !submitting && (
              <LoginMessage content="账号或密码错误！" />
            )}
            <ProFormText
              name="realUserName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
                value: loginForm.userName,
                onChange: (e) => setLoginForm({ ...loginForm, userName: e.target.value }),
              }}
              placeholder="请输入用户名"
              rules={[
                {
                  required: true,
                  message: '请输入用户名！',
                },
              ]}
            />
            <ProFormText.Password
              name="realPassWord"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
                value: loginForm.passWord,
                onChange: (e) => setLoginForm({ ...loginForm, passWord: e.target.value }),
              }}
              placeholder="请输入密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
            {/* 真实登录按钮（去除记住密码弹窗逻辑） */}
            <button
              className="ant-btn ant-btn-primary ant-btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              onClick={(e) => {
                e.preventDefault();
                handleRealLogin();
              }}
              disabled={submitting}
            >
              登录
            </button>
          </>
        )}

        {/* ===================== 注册表单（仅展示） ===================== */}
        {type === 'register' && (
          <>
            {/* 注册失败提示 */}
            {registerStatus === 'error' && !submitting && (
              <RegisterMessage content="注册失败！请检查信息" />
            )}
            <ProFormText
              name="registerUserName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
                value: registerForm.userName,
                onChange: (e) => setRegisterForm({ ...registerForm, userName: e.target.value }),
              }}
              placeholder="请输入用户名"
              rules={[
                {
                  required: true,
                  message: '请输入用户名！',
                },
              ]}
            />
            <ProFormText.Password
              name="registerPassWord"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
                value: registerForm.passWord,
                onChange: (e) => setRegisterForm({ ...registerForm, passWord: e.target.value }),
              }}
              placeholder="请输入密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
            <ProFormText.Password
              name="registerConfimPassWord"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
                value: registerForm.confimPassWord,
                onChange: (e) =>
                  setRegisterForm({ ...registerForm, confimPassWord: e.target.value }),
              }}
              placeholder="请确认密码"
              rules={[
                {
                  required: true,
                  message: '请确认密码！',
                },
              ]}
            />
            <ProFormText
              name="registerEmail"
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className={styles.prefixIcon} />,
                value: registerForm.email,
                onChange: (e) => setRegisterForm({ ...registerForm, email: e.target.value }),
              }}
              placeholder="请输入邮箱"
              rules={[
                {
                  required: true,
                  message: '请输入邮箱！',
                },
                {
                  type: 'email',
                  message: '请输入正确的邮箱格式！',
                },
              ]}
            />
            <ProFormText
              name="registerPhone"
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className={styles.prefixIcon} />,
                value: registerForm.phone,
                onChange: (e) => setRegisterForm({ ...registerForm, phone: e.target.value }),
              }}
              placeholder="请输入手机号"
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '请输入正确的手机号格式！',
                },
              ]}
            />
            {/* 注册按钮 */}
            <button
              className="ant-btn ant-btn-primary ant-btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              onClick={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              disabled={submitting}
            >
              注册
            </button>
          </>
        )}

        {/* 移除记住密码相关逻辑 */}
      </ProForm>

      {/* 原有第三方登录图标（保留） */}
      {/* <Space className={styles.other}>
        <FormattedMessage id="pages.login.loginWith" defaultMessage="Other login methods" />
        <AlipayCircleOutlined className={styles.icon} />
        <TaobaoCircleOutlined className={styles.icon} />
        <WeiboCircleOutlined className={styles.icon} />
      </Space> */}
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/realLogin'] || loading.effects['login/realSignup'], // 仅监听真实登录/注册的加载状态
}))(Login);
