import assert from 'node:assert/strict';
import { test } from 'node:test';
import { site } from '../content/site.ts';

const BANNED = [
  'excited to announce', 'thrilled', 'game-changer', 'game changer', 'revolutionize', 'unleash', 'supercharge',
  'cutting-edge', 'cutting edge', 'harness the power', 'delve', 'leverage', 'leveraging', 'leverages', 'leveraged', 'synergy',
  'the future of', "don't miss out", 'dont miss out', 'journey', 'landscape', 'ecosystem', 'ai-powered',
  "in today's fast-paced world", 'buckle up',
];
const HEADLINE_KEYS = new Set(['headline', 'tagline']);
const emoji = /\p{Extended_Pictographic}/u;

function* walk(value: unknown, path: string): Generator<[string, string, string]> {
  if (typeof value === 'string') yield [path, path.split('.').pop()!.replace(/\[\d+\]/, ''), value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* walk(v, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* walk(v, path ? `${path}.${k}` : k);
}
const strings = [...walk(site, '')];

test('site.ts has strings to lint', () => assert.ok(strings.length > 20));

test('no banned words or phrases (case-insensitive, whole phrase)', () => {
  for (const [path, , text] of strings) {
    for (const phrase of BANNED) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.ok(!new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'iu').test(text), `${path} contains banned phrase "${phrase}"`);
    }
  }
});

test('no exclamation marks', () => {
  for (const [path, , text] of strings) assert.ok(!text.includes('!'), `${path} contains "!"`);
});

test('no emoji', () => {
  for (const [path, , text] of strings) assert.ok(!emoji.test(text), `${path} contains an emoji`);
});

test('headlines are 10 words or fewer', () => {
  const headlines = strings.filter(([path, key]) => !path.startsWith('meta.') && (HEADLINE_KEYS.has(key) || key === 'title'));
  assert.ok(headlines.length >= 8);
  for (const [path, , text] of headlines) {
    const words = text.trim().split(/\s+/).length;
    assert.ok(words <= 10, `${path} has ${words} words`);
  }
});

test('empty fields stay empty until the club supplies them', () => {
  assert.equal(typeof site.joinFormUrl, 'string');
  assert.ok(site.linkedinUrl.startsWith('https://'));
});
