import { Tooltip, Tag } from 'antd';
import type { Settings as ProSettings } from '@ant-design/pro-layout';
import { LinkOutlined, GithubOutlined } from '@ant-design/icons';
import React from 'react';
import type { ConnectProps } from 'umi';
import { connect, SelectLang } from 'umi';
import type { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  theme?: ProSettings['navTheme'] | 'realDark';
} & Partial<ConnectProps> &
  Partial<ProSettings>;

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="Site Search"
        defaultValue="fx67ll"
        options={[
          { label: <a href="https://fx67ll.com">fx67ll.com</a>, value: 'fx67ll.com' },
          {
            label: <a href="https://fx67ll.xyz">fx67ll.xyz</a>,
            value: 'fx67ll.xyz',
          },
        ]}
        // onSearch={value => {
        //   //console.log('input', value);
        // }}
      />
      <Tooltip title="nav.fx67ll.com">
        <a
          style={{
            color: 'inherit',
          }}
          target="_blank"
          href="https://nav.fx67ll.com"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <LinkOutlined />
        </a>
      </Tooltip>
      <Tooltip title="fx67ll's github">
        <a
          style={{
            color: 'inherit',
          }}
          target="_blank"
          href="https://github.com/fx67ll"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <GithubOutlined />
        </a>
      </Tooltip>
      <Avatar />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
      <SelectLang className={styles.action} />
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
