import { LockOutlined, MailOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Checkbox, message, Modal, Select, Tabs } from 'antd';
import React, { useRef, useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useIntl, connect, history } from 'umi';
import type { Dispatch } from 'umi';
import Cookies from 'js-cookie';
import md5 from 'blueimp-md5';
import type { StateType } from '@/models/login';
import type { ConnectState } from '@/models/connect';
import { getCookieJSON, getPageQuery } from '@/utils/utils';

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

  // ===================== 记住密码：从 Cookie 恢复上次登录信息（与 Vue 版逻辑一致） =====================
  const savedLoginInfoRef = useRef<{ userName?: string; passWord?: string } | null>(null);
  const [initialLoginValues] = useState(() => {
    if (Cookies.get('rememberMe') === 'true') {
      const savedLoginInfo = getCookieJSON('Login-Info');
      if (savedLoginInfo && savedLoginInfo.userName && savedLoginInfo.passWord) {
        savedLoginInfoRef.current = savedLoginInfo;
        return {
          userName: savedLoginInfo.userName,
          passWord: savedLoginInfo.passWord,
          autoLogin: true,
        };
      }
    }
    return { userName: '', passWord: '', autoLogin: true };
  });

  // ===================== 登录配置弹窗 =====================
  const [loginConfigVisible, setLoginConfigVisible] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [validityTime, setValidityTime] = useState<number>(60 * 60 * 24);
  // 登录成功后的结果，供登录配置弹窗确认时写入 Cookie 使用
  const loginResultRef = useRef<{ token: string; userName: string; passWord: string } | null>(null);

  // 记住账号密码的选择时间列表
  const validityTimeOptions = [
    {
      value: 60 * 60 * 24,
      label: intl.formatMessage({ id: 'login.config.validity.24hour', defaultMessage: '24小时' }),
    },
    {
      value: 60 * 60 * 24 * 7,
      label: intl.formatMessage({ id: 'login.config.validity.7day', defaultMessage: '7天' }),
    },
    {
      value: 60 * 60 * 24 * 30,
      label: intl.formatMessage({ id: 'login.config.validity.30day', defaultMessage: '30天' }),
    },
    {
      value: 60 * 60 * 24 * 180,
      label: intl.formatMessage({ id: 'login.config.validity.180day', defaultMessage: '180天' }),
    },
    {
      value: 60 * 60 * 24 * 365,
      label: intl.formatMessage({ id: 'login.config.validity.365day', defaultMessage: '365天' }),
    },
  ];

  // ===================== 登录成功后的提示与跳转（与原 Model 中的逻辑一致） =====================
  const finishLogin = () => {
    message.success('🎉 🎉 🎉  登录成功！');
    const urlParams = new URL(window.location.href);
    const params = getPageQuery();
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
  };

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

    // 2. 与 Vue 版逻辑一致：使用 Cookie 中保存的密文登录时不再重复 MD5 加密
    const savedLoginInfo = savedLoginInfoRef.current;
    const isFromCookie = !!(
      savedLoginInfo &&
      values.userName === savedLoginInfo.userName &&
      values.passWord === savedLoginInfo.passWord
    );

    // 3. 调用真实登录
    let response: any;
    try {
      response = await dispatch({
        type: 'login/realLogin',
        payload: {
          ...values,
          validityTime: 60 * 60 * 24,
          autoLogin: true,
          isFromCookie,
        },
      });
    } catch (error: any) {
      message.error(`登录失败！${error?.message || ''}`);
      return;
    }
    if (!response || response.status !== 0) {
      message.error(`登录失败！${response?.msg || ''}`);
      return;
    }

    // 4. 保存登录结果，passWord 统一记录为 MD5 密文，供登录配置弹窗使用
    loginResultRef.current = {
      token: response.token,
      userName: values.userName,
      passWord: isFromCookie ? values.passWord : md5(values.passWord),
    };

    // 5. 与 Vue 版逻辑一致：未配置过记住密码或更换登录账号时，弹出登录配置弹窗
    const currentLoginInfo = getCookieJSON('Login-Info');
    const needLoginConfig =
      Cookies.get('rememberMe') !== 'true' ||
      !currentLoginInfo ||
      currentLoginInfo.userName !== values.userName;

    if (needLoginConfig) {
      setIsRememberMe(false);
      setValidityTime(60 * 60 * 24);
      setLoginConfigVisible(true);
    } else {
      finishLogin();
    }
  };

  // ===================== 登录配置弹窗确认 =====================
  const handleConfirmLoginConfig = () => {
    const loginResult = loginResultRef.current;
    if (loginResult) {
      const { dispatch } = props;
      dispatch({
        type: 'login/setLoginConfig',
        payload: {
          ...loginResult,
          validityTime,
          isRememberMe,
        },
      });
    }
    setLoginConfigVisible(false);
    finishLogin();
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
          initialValues={initialLoginValues}
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

      {/* ===================== 登录配置弹窗（与 Vue 版登录配置对话框逻辑一致） ===================== */}
      <Modal
        title={intl.formatMessage({
          id: 'login.config.title',
          defaultMessage: '登录配置',
        })}
        visible={loginConfigVisible}
        width={390}
        style={{ top: 200 }}
        closable={false}
        keyboard={false}
        maskClosable={false}
        footer={[
          <Button type="primary" key="loginConfigConfirm" onClick={handleConfirmLoginConfig}>
            {intl.formatMessage({
              id: 'login.config.confirm',
              defaultMessage: '确 定',
            })}
          </Button>,
        ]}
      >
        <div className={styles.tipBox}>
          <div className={styles.tipItem}>
            {intl.formatMessage({
              id: 'login.config.remember.me',
              defaultMessage: '是否记住账号密码：',
            })}
          </div>
          <div className={styles.tipItem}>
            <Checkbox checked={isRememberMe} onChange={(e) => setIsRememberMe(e.target.checked)} />
          </div>
        </div>
        <div className={styles.tipBox}>
          <div className={styles.tipItem}>
            {intl.formatMessage({
              id: 'login.config.validity.time',
              defaultMessage: '设置记住过期时间：',
            })}
          </div>
          <div className={styles.tipItem}>
            <Select
              style={{ width: '100%' }}
              value={validityTime}
              placeholder={intl.formatMessage({
                id: 'login.config.validity.placeholder',
                defaultMessage: '请选择记住过期时间',
              })}
              onChange={(value: number) => setValidityTime(value)}
            >
              {validityTimeOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div className={styles.tipBox}>
          {intl.formatMessage({
            id: 'login.config.tips',
            defaultMessage: 'Tips：暂不提供修改密码，如有需要请联系管理员 ~',
          })}
        </div>
      </Modal>
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/realLogin'] || loading.effects['login/realSignup'], // 仅监听真实登录/注册的加载状态
}))(Login);
