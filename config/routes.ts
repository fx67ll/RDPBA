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
              {
                path: '/link',
                name: 'link',
                icon: 'link',
                routes: [
                  {
                    name: '个人主页', // 二级菜单名称
                    path: 'https://fx67ll.com', // 外链地址（核心配置）
                    target: '_blank', // 可选：点击后打开新窗口
                  },
                  {
                    name: '技术博客', // 二级菜单名称
                    path: 'https://fx67ll.xyz', // 外链地址（核心配置）
                    target: '_blank', // 可选：点击后打开新窗口
                  },
                  {
                    name: '站点导航', // 二级菜单名称
                    path: 'https://nav.fx67ll.com', // 外链地址（核心配置）
                    target: '_blank', // 可选：点击后打开新窗口
                  },
                  {
                    name: '给我留言', // 二级菜单名称
                    path: 'https://fx67ll.xyz/s/messageboard', // 外链地址（核心配置）
                    target: '_blank', // 可选：点击后打开新窗口
                  },
                ],
              },
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
