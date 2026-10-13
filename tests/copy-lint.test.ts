/**
 * Voice checks from the brand guide, over every line of copy on the site:
 * src/content/copy.ts, the three YAML data files, photo alt text, and the
 * text written directly in .astro pages and components.
 *   - none of the banned words or phrases
 *   - no exclamation marks, no emoji
 *   - headlines: 10 words or fewer, sentence case, no closing period
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'yaml';
import { copy, formats } from '../src/content/copy.ts';
import { PHOTO_META } from '../src/lib/photo-meta.ts';

const ROOT = join(import.meta.dirname, '..');

const BANNED = [
  'excited to announce', 'thrilled', 'game-changer', 'game changer', 'revolutionize', 'unleash', 'supercharge',
  'cutting-edge', 'cutting edge', 'harness the power', 'delve', 'leverage', 'leveraging', 'leverages', 'leveraged',
  'synergy', 'synergies', 'the future of', "don't miss out", 'dont miss out', 'journey', 'landscape', 'ecosystem',
  'ai-powered', "in today's fast-paced world", 'buckle up',
];
// Extended_Pictographic also covers ©, ® and ™, which are fine in a footer.
const emoji = /(?![©®™])\p{Extended_Pictographic}/u;
const HEADLINE_KEYS = new Set(['headline', 'title']);
/** YAML fields that hold links, file names or codes rather than copy. */
const NOT_COPY = new Set(['link', 'linkedin', 'photo', 'photos', 'flyer', 'rsvp', 'contact_email', 'date', 'start', 'end', 'type', 'homeOrder']);

type Line = { where: string; key: string; text: string };

function* walk(value: unknown, path: string): Generator<Line> {
  if (typeof value === 'string') yield { where: path, key: path.split('.').pop()!.replace(/\[\d+\]$/, ''), text: value };
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* walk(v, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* walk(v, path ? `${path}.${k}` : k);
}

const copyLines = [...walk(copy, 'copy'), ...walk(formats, 'formats')];

const yamlLines = ['events.yaml', 'team.yaml', 'site.yaml'].flatMap((f) =>
  [...walk(parse(readFileSync(join(ROOT, 'src/data', f), 'utf8')), f)].filter(
    (l) => !NOT_COPY.has(l.key) && !l.where.startsWith(`${f}.links`) && !/^https?:\/\//.test(l.text),
  ),
);

const altLines = Object.entries(PHOTO_META).map(([name, m]) => ({ where: `photo-meta ${name}.alt`, key: 'alt', text: m.alt }));

/** Visible text written straight into .astro files: strip code, styles, scripts, tags and {expressions}. */
function astroText(source: string): string {
  let s = source.replace(/^---[\s\S]*?\n---/, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<!doctype[^>]*>/gi, ' ');
  s = s.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, ' ');
  let out = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) out += ch;
  }
  return out.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
const astroFiles = ['src/pages', 'src/components', 'src/layouts'].flatMap((dir) =>
  readdirSync(join(ROOT, dir))
    .filter((f) => f.endsWith('.astro'))
    .map((f) => `${dir}/${f}`),
);
const astroLines = astroFiles.map((f) => ({ where: f, key: 'astro', text: astroText(readFileSync(join(ROOT, f), 'utf8')) }));

const all: Line[] = [...copyLines, ...yamlLines, ...altLines, ...astroLines];

test('there is copy to lint', () => {
  assert.ok(copyLines.length > 150, `only ${copyLines.length} lines in copy.ts`);
  assert.ok(yamlLines.length > 40, `only ${yamlLines.length} lines in the YAML files`);
  assert.ok(astroFiles.length >= 20, `only ${astroFiles.length} .astro files`);
});

test('no banned words or phrases (whole phrase, any case)', () => {
  for (const { where, text } of all) {
    for (const phrase of BANNED) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.ok(!new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'iu').test(text), `${where} contains the banned phrase "${phrase}"`);
    }
  }
});

test('no exclamation marks', () => {
  for (const { where, text } of all) assert.ok(!text.includes('!'), `${where} contains "!": ${text.slice(0, 80)}`);
});

test('no emoji', () => {
  for (const { where, text } of all) assert.ok(!emoji.test(text), `${where} contains an emoji`);
});

test('headlines: 10 words or fewer, sentence case, no closing period', () => {
  const heads = copyLines.filter((l) => HEADLINE_KEYS.has(l.key) && !l.where.startsWith('copy.meta.'));
  assert.ok(heads.length >= 30, `found only ${heads.length} headlines`);
  for (const { where, text } of heads) {
    const words = text.trim().split(/\s+/);
    assert.ok(words.length <= 10, `${where} has ${words.length} words: "${text}"`);
    assert.ok(!/\.$/.test(text.trim()), `${where} ends with a period: "${text}"`);
    // Sentence case: after the first word, a capitalized word must be a name or acronym we allow.
    const PROPER = /^(AI|Wichita|State|WSU|Woolsey|Hall|Lovable|ChatGPT|Claude|Chocolathon|Cocoa|Dolce|Newman|University|Groover|Labs|NextGen|Entrepreneurs|Innovation|Design|Open|Agent|Hackathon|Club|GroupMe|ShockerSync|LinkedIn|Instagram|Wednesdays|Us|@wsuaiclub|Cargill|Unified)$/;
    for (const w of words.slice(1)) {
      const bare = w.replace(/[^\p{L}@]/gu, '');
      if (bare && /^\p{Lu}/u.test(bare)) assert.ok(PROPER.test(bare), `${where}: "${w}" breaks sentence case in "${text}"`);
    }
  }
});

test('the approved lines stay verbatim', () => {
  assert.equal(copy.home.hero.headline, 'Hands-on AI at Wichita State');
  assert.equal(copy.home.hero.lede, 'A student-led club bridging the gap between industry and the classroom.');
  assert.equal(
    copy.about.hero.lede,
    "AI Club is Wichita State's hands-on AI organization. We bring in the people deploying AI, teach members to use it, and host the hard conversations about it.",
  );
  assert.deepEqual(
    [copy.nav.about, copy.nav.events, copy.nav.contact, copy.nav.join],
    ['About Us', 'Events', 'Contact', 'Join'],
  );
});

test('the five formats stay general: no company or tool names', () => {
  const NAMES = /(Lovable|ChatGPT|Claude|Cursor|n8n|Cargill|Unified|OpenAI|Gemini|Copilot)/i;
  for (const f of formats) for (const [k, v] of Object.entries(f)) if (k !== 'photo' && k !== 'href') assert.ok(!NAMES.test(v), `formats.${f.id}.${k} names a company or tool: "${v}"`);
});

test('no recaps: the semester numbers are gone', () => {
  assert.ok(!('numbers' in copy.home) && !('numbers' in copy.about));
  assert.ok(!/stats/.test(readFileSync(join(ROOT, 'src/data/site.yaml'), 'utf8').replace(/^#.*$/gm, '')));
});

test('event headings and ledes do not pin the day or the hour', () => {
  for (const l of [copy.events.hero.headline, copy.events.hero.lede, copy.events.upcoming.lede, copy.home.formats.lede]) {
    assert.ok(!/Wednesday|5:00|7:00|225/.test(l), `"${l}" names a day, hour or room`);
  }
});

test('meta titles and descriptions are a sane length', () => {
  for (const [page, m] of Object.entries(copy.meta)) {
    assert.ok(m.title.length <= 60, `meta.${page}.title is ${m.title.length} characters`);
    assert.ok(m.description.length >= 30 && m.description.length <= 170, `meta.${page}.description is ${m.description.length} characters`);
  }
});
