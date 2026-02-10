import React, { useState, useEffect } from 'react';
// import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import md5 from 'blueimp-md5';
import type { Dispatch } from 'umi';
import { useIntl, connect, FormattedMessage, useDispatch, history } from 'umi';
import { LockOutlined, MailOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Space, message, Tabs, Modal, Select, Checkbox } from 'antd';
import ProForm, { ProFormCaptcha, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { getFakeCaptcha } from '@/services/login';
import type { ConnectState } from '@/models/connect';
import type { StateType } from '@/models/login';
import type { LoginParamsType, RegisterFormType, FakeLoginParamsType } from '@/services/login';
import { getPageQuery } from '@/utils/utils';

import styles from './index.less';

export type LoginProps = {
  dispatch: Dispatch;
  userLogin: StateType;
  submitting?: boolean;
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
);

// 封装：安全获取JSON格式的Cookie
const getCookieJSON = (key: string) => {
  try {
    const cookieStr = Cookies.get(key);
    if (!cookieStr) return null;
    return JSON.parse(cookieStr);
  } catch (e) {
    console.warn(`解析Cookie ${key} 失败`, e);
    return null;
  }
};

const Login: React.FC<LoginProps> = (props) => {
  const { userLogin = {}, submitting } = props;

  const intl = useIntl();
  const dispatch = useDispatch();
  const { status, type: loginType, token } = userLogin;

  const [formType, setFormType] = useState<string>('account');
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [isNeedCookie, setIsNeedCookie] = useState<boolean>(false);
  const [isRememberMe, setIsRememberMe] = useState<boolean>(false);
  const [tokenLocal, setTokenLocal] = useState<string>(token || '');

  // 有效期选项
  const validityTimeOptions = [
    { value: 60 * 60 * 24, label: '24小时' },
    { value: 60 * 60 * 24 * 7, label: '7天' },
    { value: 60 * 60 * 24 * 30, label: '30天' },
    { value: 60 * 60 * 24 * 180, label: '180天' },
    { value: 60 * 60 * 24 * 365, label: '365天' },
  ];

  // 登录表单状态
  const [loginForm, setLoginForm] = useState<LoginParamsType>({
    userName: '',
    passWord: '',
    validityTime: 60 * 60 * 24,
    isFromCookie: false,
    autoLogin: true,
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState<RegisterFormType>({
    userName: '',
    passWord: '',
    confimPassWord: '',
    email: '',
    phone: '',
    level: 16,
  });

  // 手机号登录表单状态
  const [mobileForm, setMobileForm] = useState<FakeLoginParamsType>({
    userName: '',
    password: '',
    mobile: '',
    captcha: '',
  });

  // 切换到注册
  const createAccount = () => setIsRegister(true);
  // 切换到登录
  const loginNow = () => setIsRegister(false);

  // 检查对象是否有空字段
  const objectHasNull = (obj: Record<string, any>): boolean => {
    return Object.values(obj).some((val) => val === '' || val === undefined);
  };

  // 提交警告提示
  const submitWarning = (text: string) => {
    message.error(text);
  };

  // 页面加载时检查Cookie中的登录信息
  const ifRememberMe = () => {
    const rememberMeCookie = Cookies.get('rememberMe');
    if (rememberMeCookie) {
      const rememberMe = JSON.parse(rememberMeCookie || 'false');
      const loginInfo = getCookieJSON('Login-Info');
      if (rememberMe && loginInfo) {
        setLoginForm((prev) => ({
          ...prev,
          ...loginInfo,
          validityTime: 60 * 60 * 24,
          autoLogin: true,
          isFromCookie: true,
        }));
      }
    }
  };

  // 登录成功后处理记住密码逻辑
  // const isNeedRememberMe = useCallback(() => {
  //   if (token) {
  //     setTokenLocal(token);
  //     const loginInfo = getCookieJSON('Login-Info');
  //     if (
  //       !Cookies.get('rememberMe') ||
  //       !loginInfo ||
  //       (loginInfo && loginForm.userName !== loginInfo.userName)
  //     ) {
  //       setIsNeedCookie(true);
  //     }
  //   }
  // }, [token, loginForm.userName]);

  // 确认记住密码配置
  const checkLoginOption = () => {
    const expires = loginForm.validityTime / (60 * 60 * 24);
    const path = '/';

    if (isRememberMe) {
      Cookies.set('User-Token', tokenLocal, { expires, path });
      Cookies.set('rememberMe', JSON.stringify(true), { path });
      Cookies.set(
        'Login-Info',
        JSON.stringify({
          userName: loginForm.userName,
          passWord: loginForm.passWord,
          validityTime: loginForm.validityTime,
          isFromCookie: true,
        }),
        { path, expires },
      );
    } else {
      Cookies.remove('rememberMe', { path });
      Cookies.remove('Login-Info', { path });
      Cookies.remove('User-Token', { path });
    }

    setIsNeedCookie(false);

    // 重置表单
    setLoginForm({
      userName: '',
      passWord: '',
      validityTime: 60 * 60 * 24,
      isFromCookie: false,
      autoLogin: true,
    });

    // 跳转逻辑
    const urlParams = new URL(window.location.href);
    const params = getPageQuery();
    let { redirect } = params as { redirect: string };
    if (redirect) {
      // 判断redirect是否为绝对路径
      if (redirect.startsWith('http://') || redirect.startsWith('https://')) {
        const redirectUrlParams = new URL(redirect);
        if (redirectUrlParams.origin === urlParams.origin) {
          redirect = redirectUrlParams.pathname + redirectUrlParams.search + redirectUrlParams.hash;
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
      } else {
        // 相对路径
        if (window.routerBase !== '/') {
          redirect = redirect.replace(window.routerBase, '/');
        }
        if (redirect.match(/^\/.*#/)) {
          redirect = redirect.substr(redirect.indexOf('#') + 1);
        }
      }
      history.replace(redirect || '/');
    } else {
      history.replace('/');
    }
  };

  // 处理注册逻辑
  const handleRegister = async () => {
    // 1. 表单非空验证
    if (objectHasNull(registerForm)) {
      submitWarning('注册信息均不能为空！');
      return;
    }

    // 2. 密码一致性验证
    if (registerForm.passWord !== registerForm.confimPassWord) {
      submitWarning('两次输入的密码不一致！');
      return;
    }

    try {
      // 3. 构造注册参数（删除确认密码+密码加密）
      const submitData = {
        ...registerForm,
        passWord: md5(registerForm.passWord),
      };
      delete (submitData as any).confimPassWord;

      // 4. 调用model的register effect
      await dispatch({
        type: 'login/register',
        payload: submitData,
      });

      // 注册成功：切换到登录表单 + 重置注册表单
      setLoginForm((prev) => ({
        ...prev,
        userName: registerForm.userName,
        passWord: '',
      }));
      setIsRegister(false);
      setRegisterForm({
        userName: '',
        passWord: '',
        confimPassWord: '',
        email: '',
        phone: '',
        level: 16,
      });
    } catch (error) {
      submitWarning('注册异常！请重试');
    }
  };

  // 处理账号密码登录
  const handleAccountLogin = async () => {
    // 1. 表单非空验证
    if (objectHasNull({ userName: loginForm.userName, passWord: loginForm.passWord })) {
      submitWarning('账号或密码不能为空！');
      return;
    }

    try {
      // 2. 密码加密处理
      const loginInfo = getCookieJSON('Login-Info');
      const lastUserName = loginInfo?.userName || '';
      const lastPassWord = loginInfo?.passWord || '';

      let submitPassWord = loginForm.passWord;
      if (
        !loginForm.isFromCookie ||
        loginForm.userName !== lastUserName ||
        loginForm.passWord !== lastPassWord
      ) {
        submitPassWord = md5(submitPassWord);
      }

      // 3. 构造登录参数
      const loginParams = {
        ...loginForm,
        passWord: submitPassWord,
        type: formType,
      };

      // 4. 调用model的login effect
      const result = await dispatch({
        type: 'login/login',
        payload: loginParams,
      });

      // console.log('result', result);

      // 5. 从dispatch返回的结果中获取token
      if (result && (result as any)?.token) {
        setTokenLocal((result as any)?.token);
        // 直接调用记住密码检查
        // const loginInfo = getCookieJSON('Login-Info');
        if (
          !Cookies.get('rememberMe') ||
          !loginInfo ||
          (loginInfo && loginForm.userName !== loginInfo.userName)
        ) {
          setIsNeedCookie(true);
        }
      }
    } catch (error) {
      // 使用函数式更新，只清空密码，保留账号
      setLoginForm((prev) => ({
        ...prev,
        passWord: '',
      }));
      submitWarning('登录失败！账号或密码错误');
    }
  };

  // 处理手机号登录
  const handleMobileLogin = async () => {
    if (!mobileForm.mobile) {
      submitWarning('请输入手机号！');
      return;
    }
    if (!mobileForm.captcha) {
      submitWarning('请输入验证码！');
      return;
    }

    try {
      await dispatch({
        type: 'login/login',
        payload: { ...mobileForm, type: 'mobile' },
      });
    } catch (error) {
      submitWarning('手机号登录失败！');
    }
  };

  // 游客提示
  const showTips = () => {
    setTimeout(() => {
      if (!Cookies.get('rememberMe') && !getCookieJSON('Login-Info')) {
        message.info('游客提示：请自行注册账号以体验完整的业务流程');
      }
    }, 100);
  };

  // 组件挂载时检查Cookie
  useEffect(() => {
    ifRememberMe();
    showTips();
  }, []);

  // 监听token变化，处理记住密码
  useEffect(() => {
    if (token && status === 'ok' && loginType === 'account') {
      setTokenLocal(token);
      const loginInfo = getCookieJSON('Login-Info');
      if (
        !Cookies.get('rememberMe') ||
        !loginInfo ||
        (loginInfo && loginForm.userName !== loginInfo.userName)
      ) {
        setIsNeedCookie(true);
      }
    }
  }, [token, status, loginType, loginForm.userName]);

  // 统一表单提交处理
  const handleFormSubmit = () => {
    if (isRegister) {
      handleRegister();
    } else {
      if (formType === 'account') {
        handleAccountLogin();
      } else {
        handleMobileLogin();
      }
    }
  };

  return (
    <div className={styles.main}>
      {/* 记住密码配置弹窗 */}
      <Modal
        title="登录配置"
        open={isNeedCookie}
        onCancel={() => setIsNeedCookie(false)}
        onOk={checkLoginOption}
        maskClosable={false}
        closable={false}
        destroyOnClose
        width={390}
        style={{ top: 170 }}
      >
        <div style={{ marginBottom: 16 }}>
          <span>是否记住账号密码：</span>
          <Checkbox
            checked={isRememberMe}
            onChange={(e) => setIsRememberMe(e.target.checked)}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <span>设置记住过期时间：</span>
          <Select
            value={loginForm.validityTime}
            onChange={(value) => setLoginForm((prev) => ({ ...prev, validityTime: value }))}
            style={{ width: 200, marginLeft: 8 }}
          >
            {validityTimeOptions.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div style={{ color: '#666', fontSize: 12 }}>
          Tips：暂不提供修改密码，如有需要请联系管理员 ~
        </div>
      </Modal>

      <ProForm
        submitter={{
          render: () => [
            <button
              key="submitBtn"
              type="button"
              className="ant-btn ant-btn-primary ant-btn-lg"
              style={{ width: '100%' }}
              onClick={handleFormSubmit}
              disabled={submitting}
            >
              {submitting ? '处理中...' : isRegister ? '注册' : '登录'}
            </button>,
          ],
        }}
        onFinish={() => Promise.resolve()}
      >
        {/* 登录/注册切换 + 账号/手机号登录Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Tabs activeKey={formType} onChange={setFormType}>
            <Tabs.TabPane
              key="account"
              tab={intl.formatMessage({
                id: 'pages.login.accountLogin.tab',
                defaultMessage: 'Account password login',
              })}
            />
            <Tabs.TabPane
              key="mobile"
              tab={intl.formatMessage({
                id: 'pages.login.phoneLogin.tab',
                defaultMessage: 'Mobile phone number login',
              })}
            />
          </Tabs>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (isRegister) {
                loginNow();
              } else {
                createAccount();
              }
            }}
          >
            {isRegister ? '立刻登录' : '立刻创建'}
          </a>
        </div>

        {/* 登录错误提示 */}
        {status === 'error' && loginType === 'account' && !submitting && (
          <LoginMessage
            content={intl.formatMessage({
              id: 'pages.login.accountLogin.errorMessage',
              defaultMessage: 'Incorrect account or password',
            })}
          />
        )}

        {/* 注册表单 */}
        {isRegister && (
          <>
            <ProFormText
              name="registerUserName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
                value: registerForm.userName,
                onChange: (e) => setRegisterForm((prev) => ({ ...prev, userName: e.target.value })),
              }}
              placeholder="Username"
              rules={[{ required: true, message: '请输入用户名！' }]}
            />
            <ProFormText.Password
              name="registerPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
                value: registerForm.passWord,
                onChange: (e) => setRegisterForm((prev) => ({ ...prev, passWord: e.target.value })),
              }}
              placeholder="Password"
              rules={[{ required: true, message: '请输入密码！' }]}
            />
            <ProFormText.Password
              name="confimPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
                value: registerForm.confimPassWord,
                onChange: (e) =>
                  setRegisterForm((prev) => ({ ...prev, confimPassWord: e.target.value })),
              }}
              placeholder="Confirm Password"
              rules={[{ required: true, message: '请确认密码！' }]}
            />
            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className={styles.prefixIcon} />,
                value: registerForm.email,
                onChange: (e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value })),
              }}
              placeholder="Email"
              rules={[{ required: true, message: '请输入邮箱！' }]}
            />
            <ProFormText
              name="phone"
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className={styles.prefixIcon} />,
                value: registerForm.phone,
                onChange: (e) => setRegisterForm((prev) => ({ ...prev, phone: e.target.value })),
              }}
              placeholder="Phone"
              rules={[{ required: true, message: '请输入手机号！' }]}
            />
          </>
        )}

        {/* 登录表单（账号密码） */}
        {!isRegister && formType === 'account' && (
          <>
            <ProFormText
              name="userName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
                value: loginForm.userName,
                onChange: (e) => setLoginForm((prev) => ({ ...prev, userName: e.target.value })),
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
              name="passWord"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
                value: loginForm.passWord,
                onChange: (e) => setLoginForm((prev) => ({ ...prev, passWord: e.target.value })),
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: 'Please enter password',
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
          </>
        )}

        {/* 登录表单（手机号+验证码） */}
        {!isRegister && formType === 'mobile' && (
          <>
            <ProFormText
              name="mobile"
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className={styles.prefixIcon} />,
                value: mobileForm.mobile,
                onChange: (e) => setMobileForm((prev) => ({ ...prev, mobile: e.target.value })),
              }}
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
              name="captcha"
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className={styles.prefixIcon} />,
                value: mobileForm.captcha,
                onChange: (e) => setMobileForm((prev) => ({ ...prev, captcha: e.target.value })),
              }}
              captchaProps={{ size: 'large' }}
              placeholder={intl.formatMessage({
                id: 'pages.login.captcha.placeholder',
                defaultMessage: 'Please enter verification code',
              })}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${intl.formatMessage({
                    id: 'pages.getCaptchaSecondText',
                    defaultMessage: 's后重新获取',
                  })}`;
                }
                return intl.formatMessage({
                  id: 'pages.login.phoneLogin.getVerificationCode',
                  defaultMessage: 'Get verification code',
                });
              }}
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
                if (!/^1\d{10}$/.test(mobile)) {
                  submitWarning('请输入正确的手机号！');
                  return false;
                }
                const result = await getFakeCaptcha(mobile);
                if (result) {
                  message.success('验证码发送成功！验证码：1234');
                }
                return result;
              }}
            />
          </>
        )}

        {/* 记住密码/忘记密码 */}
        {!isRegister && (
          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox
              noStyle
              name="autoLogin"
              // checked={loginForm.autoLogin}
              // onChange={(e: any) =>
              //   setLoginForm((prev) => ({ ...prev, autoLogin: e.target.checked }))
              // }
            >
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="Auto login" />
            </ProFormCheckbox>
            <a style={{ float: 'right' }}>
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="Forget password" />
            </a>
          </div>
        )}
      </ProForm>

      <Space className={styles.other} />
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects?.['login/login'] || loading.effects?.['login/register'],
}))(Login);
