import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'DNIP',
  tagline: 'Distibuted Node Interface Protocol',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://dnip-labs.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: false,
  projectName: 'docs',
  organizationName: 'dnip-labs',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      uk: {
        label: 'Українська',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          versions: {
            current: {
              label: 'Next',
            },
          },
          sidebarPath: './sidebars.ts',
          path: 'docs',      // ← твоя директория
          routeBasePath: '/',   // ← без /docs в урле
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
            // 'https://github.com/dnip-labs/docs/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'DNIP',
      logo: {
        alt: 'DNIP Logo',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: ' ',
        },
        // {
        //   type: 'localeDropdown',
        //   position: 'right',
        // },
        // {
        //   href: 'https://github.com/facebook/docusaurus',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    // footer: {
    //   style: 'dark',
    //   links: [
    //     // {
    //     //   title: 'Docs',
    //     //   items: [
    //     //     {
    //     //       label: 'Tutorial',
    //     //       to: '/docs/intro',
    //     //     },
    //     //   ],
    //     // },
    //     // {
    //     //   title: 'Community',
    //     //   items: [
    //     //     {
    //     //       label: 'Stack Overflow',
    //     //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
    //     //     },
    //     //     {
    //     //       label: 'Discord',
    //     //       href: 'https://discordapp.com/invite/docusaurus',
    //     //     },
    //     //     {
    //     //       label: 'X',
    //     //       href: 'https://x.com/docusaurus',
    //     //     },
    //     //   ],
    //     // },
    //     // {
    //     //   title: 'More',
    //     //   items: [
    //     //     {
    //     //       label: 'GitHub Node.js SDK',
    //     //       href: 'https://github.com/dnip-labs/dnip-devkit',
    //     //     },
    //     //   ],
    //     // },
    //   ],
    //   // copyright: `Copyright © ${new Date().getFullYear()} Built with Docusaurus.`,
    // },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
