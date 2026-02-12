import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography, Image } from 'antd'; // 增加了 Image 导入
import { useIntl, FormattedMessage } from 'umi';
import styles from './Welcome.less';

const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default (): React.ReactNode => {
  const intl = useIntl();
  return (
    <PageContainer>
      <Card>
        <Alert
          message={intl.formatMessage({
            id: 'pages.welcome.Message',
            defaultMessage: '欢迎到访 `react.fx67ll.com`，这里是 fx67ll 的 Recat.js 示例站点~',
          })}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />

        <Typography.Text strong>
          <FormattedMessage id="pages.welcome.advancedComponent" defaultMessage="更多信息" />{' '}
          <a href="https://fx67ll.com" rel="noopener noreferrer" target="__blank">
            <FormattedMessage id="pages.welcome.link" defaultMessage="Welcome" />
          </a>
        </Typography.Text>
        <CodePreview>https://fx67ll.com</CodePreview>

        <Typography.Text
          strong
          style={{
            marginBottom: 12,
          }}
        >
          <FormattedMessage id="pages.welcome.advancedLayout" defaultMessage="更多信息" />{' '}
          <a href="https://fx67ll.xyz" rel="noopener noreferrer" target="__blank">
            <FormattedMessage id="pages.welcome.link" defaultMessage="Welcome" />
          </a>
        </Typography.Text>
        <CodePreview>https://fx67ll.xyz</CodePreview>

        {/* 添加图片展示区域 */}
        <div style={{ width: 123, height: 123, marginTop: 36, textAlign: 'center' }}>
          <Image
            src="https://test.fx67ll.com/fx67ll-img-collection/fx67ll.jpg"
            alt="fx67ll welcome"
            style={{ maxWidth: '100%', borderRadius: 8 }}
            placeholder // 可选：加载占位效果
          />
        </div>
      </Card>
    </PageContainer>
  );
};
