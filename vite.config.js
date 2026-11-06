import { defineConfig } from 'vite';
import { readdirSync, cpSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pages = [
  'index.html',
  'case-studies.html',
  'about-me.html',
  'contact-me.html',
  'explorations.html',
  'ui-explorations.html',
  'coding.html',
  ...['companies', 'case-studies'].flatMap((dir) =>
    readdirSync(dir)
      .filter((name) => name.endsWith('.html'))
      .map((name) => `${dir}/${name}`),
  ),
];
export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace(/\.html$/, ''), resolve(page)])),
    },
  },
  plugins: [
    {
      name: 'copy-shared-assets',
      closeBundle() {
        for (const file of [
          'header.html',
          'footer.html',
          'header-and-footer-loader.js',
          'theme.js',
          'ambience.js',
        ])
          copyFileSync(file, resolve('dist', file));
        cpSync('images', 'dist/images', { recursive: true });
      },
    },
  ],
});
