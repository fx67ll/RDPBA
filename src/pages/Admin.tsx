import React from 'react';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';
import { Card, Typography, Alert } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useIntl } from 'umi';

export default (): React.ReactNode => {
  const intl = useIntl();
  return (
    <PageHeaderWrapper
      // content={intl.formatMessage({
      //   id: 'pages.admin.subPage.title',
      //   defaultMessage: 'This page can only be viewed by admin',
      // })}
      content=""
    >
      <Card>
        <Alert
          message={intl.formatMessage({
            id: 'pages.welcome.alertMessage',
            defaultMessage: '更多精彩演示站点，请访问 `https://fx67ll.com`',
          })}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 48,
          }}
        />
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          <SmileTwoTone twoToneColor="#2ECC71" /> fx67ll.com <HeartTwoTone twoToneColor="#2ECC71" />{' '}
          You
        </Typography.Title>
      </Card>
      <p style={{ textAlign: 'center', marginTop: 24 }}>
        Want to contact fx67ll.com? Please visit{' '}
        <a href="https://fx67ll.xyz/messageboard" target="_blank" rel="noopener noreferrer">
          messageboard
        </a>
        。
      </p>
    </PageHeaderWrapper>
  );
};
