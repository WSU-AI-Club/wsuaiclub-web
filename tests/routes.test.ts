/**
 * Routing guards: /chocolathon belongs to the event site (proxied by Vercel),
 * old event paths keep redirecting there, and the club's own pages are real
 * files, so there is no single-page-app fallback.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { copy } from '../src/content/copy.ts';

const ROOT = join(import.meta.dirname, '..');
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));

test('vercel.json serves real pages with clean URLs', () => {
  assert.equal(vercel.cleanUrls, true);
  assert.equal(vercel.trailingSlash, false);
  for (const r of vercel.rewrites) assert.ok(!/index\.html/.test(r.destination), 'no SPA fallback to /index.html');
});

test('/chocolathon is proxied to the event site', () => {
  const rewrites = vercel.rewrites.map((r: { source: string; destination: string }) => `${r.source} -> ${r.destination}`);
  assert.ok(rewrites.includes('/chocolathon -> https://chocolathon.vercel.app/chocolathon'));
  assert.ok(rewrites.includes('/chocolathon/:path* -> https://chocolathon.vercel.app/chocolathon/:path*'));
});

test('old event paths redirect (307) to /chocolathon, but never a club page', () => {
  const [r] = vercel.redirects;
  assert.equal(r.permanent, false);
  assert.equal(r.destination, '/chocolathon/$1');
  const re = new RegExp(`^${r.source}$`);
  for (const old of ['/hq', '/prompts', '/competitors', '/people', '/judge-c7m2x9', '/upload-k4n8pq', '/results-m3v8tq', '/hq/']) {
    assert.ok(re.test(old), `${old} should redirect`);
  }
  for (const page of ['/', '/about', '/events', '/team', '/advisory-board', '/contact', '/join']) {
    assert.ok(!re.test(page), `${page} is a club page and must not redirect`);
  }
});

test('nothing on this site claims the /chocolathon path', () => {
  assert.ok(!existsSync(join(ROOT, 'public/chocolathon')));
  const pages = readdirSync(join(ROOT, 'src/pages'));
  assert.ok(!pages.some((p) => p.startsWith('chocolathon')), 'no src/pages/chocolathon*');
  for (const p of ['index', 'about', 'events', 'team', 'advisory-board', 'contact', 'join', '404']) assert.ok(pages.includes(`${p}.astro`), `src/pages/${p}.astro`);
});

test('every header menu anchor has a matching id on its page', () => {
  const topicIds = copy.contact.topics.items.map((t) => t.id);
  for (const menu of Object.values(copy.nav.menus)) {
    for (const item of menu.items) {
      const [path, hash] = item.href.split('#');
      if (!hash) continue;
      const page = readFileSync(join(ROOT, 'src/pages', `${path.slice(1) || 'index'}.astro`), 'utf8');
      const found = page.includes(`id="${hash}"`) || (path === '/contact' && topicIds.includes(hash));
      assert.ok(found, `${item.href} has no id="${hash}" on ${path}`);
    }
  }
});

test('the contact sponsor card sits right after the partner card', () => {
  const ids = copy.contact.topics.items.map((t) => t.id);
  assert.equal(ids.indexOf('sponsor'), ids.indexOf('partner') + 1);
  assert.equal(ids[0], 'consulting');
});
