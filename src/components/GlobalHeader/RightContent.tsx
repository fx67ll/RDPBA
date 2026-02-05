import { Tooltip, Tag } from 'antd';
import type { Settings as ProSettings } from '@ant-design/pro-layout';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
        defaultValue="umi ui"
        options={[
          { label: <a href="https://fx67ll.com">fx67ll.com</a>, value: 'fx67ll.com' },
          {
            label: <a href="https://fx67ll.xyz">fx67ll.xyz</a>,
            value: 'fx67ll.xyz',
          },
          // {
          //   label: <a href="https://protable.ant.design/">Pro Table</a>,
          //   value: 'Pro Table',
          // },
          // {
          //   label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
          //   value: 'Pro Layout',
          // },
        ]}
        // onSearch={value => {
        //   //console.log('input', value);
        // }}
      />
      <Tooltip title="Use documentation">
        <a
          style={{
            color: 'inherit',
          }}
          target="_blank"
          href="https://fx67ll.xyz/s/messageboard"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <QuestionCircleOutlined />
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
