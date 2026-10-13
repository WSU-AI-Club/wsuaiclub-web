// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.wsuaiclub.com',
  // Vercel serves about.html at /about (vercel.json: cleanUrls, trailingSlash false).
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !/\/404(\.html)?$/.test(page),
    }),
  ],
  server: { host: '127.0.0.1', port: 5178 },
});
