/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 */
export default {
  dev: {
    '/express-api/': {
      // target: 'http://localhost:8001', // npm run start 可以走本地mock数据
      target: 'https://node.fx67ll.com',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  test: {
    '/express-api/': {
      // target: 'http://localhost:8001', // npm run start 可以走本地mock数据
      target: 'https://node.fx67ll.com',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/express-api/': {
      // target: 'http://localhost:8001', // npm run start 可以走本地mock数据
      target: 'https://node.fx67ll.com',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
