// Renders public/og-image.png (1200x630): Paper ground, horizontal lockup, tagline in Geist.
// Needs playwright-core and a Chromium. Set CHROME_PATH if it is not auto-found.
// Usage: node scripts/make-og.mjs
import { chromium } from 'playwright-core';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

const lockup = readFileSync('public/brand/lockup-horizontal-black.svg').toString('base64');
const b64 = (f) => `data:font/woff2;base64,${readFileSync(join(process.cwd(), f)).toString('base64')}`;
const font = b64('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2');
const mono = b64('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2');
const html = `<!doctype html><style>
@font-face{font-family:G;src:url(${font});font-weight:100 900}
@font-face{font-family:GM;src:url(${mono});font-weight:100 900}
html,body{margin:0}
body{width:1200px;height:630px;background:#f5f2ea;color:#0b0b0c;font-family:G;position:relative}
img{position:absolute;left:72px;top:72px;width:420px}
.rule{position:absolute;left:72px;right:72px;top:398px;border-top:3px solid #0b0b0c}
h1{position:absolute;left:72px;top:306px;margin:0;font-size:74px;line-height:1;font-weight:600;letter-spacing:-0.03em}
p{position:absolute;left:72px;top:432px;margin:0;font-family:GM;font-weight:500;font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:#5a564e}
</style><img src="data:image/svg+xml;base64,${lockup}"><h1>Hands-on AI at Wichita State.</h1><div class="rule"></div><p>Wichita State · AI Club · wsuaiclub.com</p>`;

const candidates = [process.env.CHROME_PATH, join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe')].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('og-image.png written');
