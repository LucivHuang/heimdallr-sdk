import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/heimdallr-sdk/',
  title: "HEIMDALLR-SDK",
  description: "A official document site of heimdallr-sdk",
  head:[
    ['link', { rel: 'icon', href: '/heimdallr-sdk/logo.svg' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: '介绍', link: '/intro/framework' },
      { text: '使用', link: '/usage/browser' },
      { text: '赞助', link: '/sponsor/index' }
    ],

    sidebar: [
      {
        text: '介绍',
        items: [
          { text: '架构', link: '/intro/framework' },
          { text: '核心', link: '/intro/core' },
          { text: '插件', link: '/intro/plugin' },
          { text: '管理', link: '/intro/manager' },
          { text: '工具', link: '/intro/tool' }
        ]
      },
      {
        text: '使用',
        items: [
          { text: '浏览器', link: '/usage/browser' },
          { text: 'NodeJS', link: '/usage/node' },
          { text: '微信小程序', link: '/usage/wx' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LucivHuang/heimdallr-sdk' }
    ]
  }
})
