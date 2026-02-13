export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './User/login',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            component: '../layouts/BasicLayout',
            authority: ['admin', 'user'],
            routes: [
              {
                path: '/',
                redirect: '/welcome',
              },
              {
                path: '/welcome',
                name: 'welcome',
                icon: 'smile',
                component: './Welcome',
              },
              {
                path: '/admin',
                name: 'admin',
                icon: 'crown',
                component: './Admin',
                authority: ['admin'],
                routes: [
                  {
                    path: '/admin/sub-page',
                    name: 'sub-page',
                    icon: 'smile',
                    component: './Welcome',
                    authority: ['admin'],
                  },
                ],
              },
              // {
              //   name: 'list.table-list',
              //   icon: 'table',
              //   path: '/list/mock',
              //   component: './TableList',
              // },
              {
                name: 'list.student-list',
                icon: 'table',
                path: '/list/student',
                component: './StudentList',
              },
              {
                component: './404',
              },
              // {
              //   path: '/link',
              //   name: 'link',
              //   icon: 'link',
              //   routes: [
              //     {
              //       name: '个人站点导航', // 二级菜单名称
              //       path: 'https://nav.fx67ll.com', // 外链地址（核心配置）
              //       target: '_blank', // 可选：点击后打开新窗口
              //     },
              //     {
              //       name: '个人日常H5工具',
              //       path: 'https://life.fx67ll.com',
              //       target: '_blank',
              //     },
              //     {
              //       name: '个人管理后台',
              //       path: 'https://vip.fx67ll.com',
              //       target: '_blank',
              //     },
              //     {
              //       name: 'Node.js 练习作品，使用 Express + MongoDB 构建',
              //       path: 'https://node.fx67ll.com',
              //       target: '_blank',
              //     },
              //     {
              //       name: 'Three.js 作品合集',
              //       path: 'https://three.fx67ll.com',
              //       target: '_blank',
              //     },
              //     {
              //       name: 'uni-app 作品示例合集',
              //       path: 'https://uni.fx67ll.com',
              //       target: '_blank',
              //     },
              //     {
              //       name: 'React.js 练习作品，基于 Ant-Design-Pro + MongoDB 搭建',
              //       path: 'https://react.fx67ll.com',
              //       target: '_blank',
              //     },
              //     {
              //       name: '大数据可视化图表地图的示例网站（暂未完成，持续开发中，敬请期待...）',
              //       path: 'https://map.fx67ll.com',
              //       target: '_blank',
              //     },
              //   ],
              // },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
