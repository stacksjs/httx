import type { BunpressConfig } from 'bunpress'

const config: BunpressConfig = {
  name: 'httx',
  description: 'A modern, lightweight HTTP client for CLI and library usage. Like httpie, written in TypeScript.',
  url: 'https://httx.stacksjs.org',
  theme: 'docs',

  nav: [
    { text: 'Guide', link: '/guide' },
    { text: 'CLI', link: '/cli' },
    { text: 'Features', link: '/features/methods' },
    { text: 'API', link: '/api' },
    { text: 'Advanced', link: '/advanced' },
    { text: 'GitHub', link: 'https://github.com/stacksjs/httx' },
  ],

  sidebar: {
    '/guide/': [
      { text: 'Introduction', link: '/guide' },
      { text: 'Installation', link: '/guide/installation' },
      { text: 'Quick Start', link: '/guide/quick-start' },
      { text: 'Configuration', link: '/guide/configuration' },
    ],
    '/cli/': [
      { text: 'Overview', link: '/cli' },
      { text: 'HTTP Methods', link: '/cli/methods' },
      { text: 'Request Options', link: '/cli/options' },
      { text: 'Authentication', link: '/cli/authentication' },
      { text: 'File Uploads', link: '/cli/file-uploads' },
    ],
    '/features/': [
      { text: 'HTTP Methods', link: '/features/methods' },
      { text: 'Headers & Body', link: '/features/headers-body' },
      { text: 'Authentication', link: '/features/authentication' },
      { text: 'File Handling', link: '/features/files' },
    ],
    '/api/': [
      { text: 'Overview', link: '/api' },
      { text: 'HttxClient', link: '/api/client' },
      { text: 'Request Options', link: '/api/request-options' },
      { text: 'Response Handling', link: '/api/response' },
      { text: 'Error Handling', link: '/api/errors' },
    ],
    '/advanced/': [
      { text: 'Overview', link: '/advanced' },
      { text: 'Configuration', link: '/advanced/configuration' },
      { text: 'Retry Logic', link: '/advanced/retry' },
      { text: 'Streaming', link: '/advanced/streaming' },
      { text: 'Timeouts', link: '/advanced/timeouts' },
      { text: 'Performance', link: '/advanced/performance' },
      { text: 'CI/CD Integration', link: '/advanced/ci-cd' },
    ],
  },

  search: true,
  editLink: {
    pattern: 'https://github.com/stacksjs/httx/edit/main/docs/:path',
    text: 'Edit this page on GitHub',
  },

  socialLinks: [
    { icon: 'github', link: 'https://github.com/stacksjs/httx' },
    { icon: 'discord', link: 'https://discord.gg/stacksjs' },
  ],
}

export default config
