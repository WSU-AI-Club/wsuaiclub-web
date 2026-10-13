// Renders public/og-image.png (1200x630), the link preview for every page:
// Paper ground, the horizontal lockup, a 3px rule, the headline in Geist,
// the bridge line in Newsreader and the address in Geist Mono.
// Needs playwright-core and Chrome, Edge or a Playwright Chromium.
// Set CHROME_PATH to use a specific browser.
// Usage: npm run og
import { chromium } from 'playwright-core';
import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';

const file = (f) => readFileSync(join(process.cwd(), f));
const lockup = file('public/brand/lockup-horizontal-black.svg').toString('base64');
const font = (f) => `data:font/woff2;base64,${file(f).toString('base64')}`;
const geist = font('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2');
const mono = font('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2');
const serif = font('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:G;src:url(${geist});font-weight:100 900}
@font-face{font-family:GM;src:url(${mono});font-weight:100 900}
@font-face{font-family:N;src:url(${serif});font-weight:200 800}
html,body{margin:0}
body{width:1200px;height:630px;background:#f5f2ea;color:#0b0b0c;font-family:G;position:relative;overflow:hidden}
.top{position:absolute;left:72px;right:72px;top:64px;display:flex;justify-content:space-between;align-items:center}
.top img{width:250px}
.label{font-family:GM;font-weight:500;font-size:20px;letter-spacing:.08em;text-transform:uppercase;color:#5a564e}
.rule{position:absolute;left:72px;right:72px;top:178px;border-top:3px solid #0b0b0c}
h1{position:absolute;left:72px;top:232px;margin:0;font-size:96px;line-height:.95;font-weight:600;letter-spacing:-0.038em;max-width:960px}
p{position:absolute;left:72px;top:440px;margin:0;font-family:N;font-size:31px;line-height:1.3;color:#5a564e;white-space:nowrap}
.foot{position:absolute;left:72px;right:72px;bottom:52px;display:flex;justify-content:space-between}
</style>
<div class="top"><img src="data:image/svg+xml;base64,${lockup}"><span class="label">Student-led · Fall 2026</span></div>
<div class="rule"></div>
<h1>Hands-on AI at Wichita State</h1>
<p>A student-led club bridging the gap between industry and the classroom.</p>
<div class="foot"><span class="label">wsuaiclub.com</span><span class="label">Wednesdays · Woolsey Hall</span></div>`;

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'),
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('public/og-image.png written');
