/**
 * The officer-edited files (src/data/*.yaml) pass the same schema the build
 * uses, and a bad edit fails with a message an officer can act on.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { initials, isoAt, longDate, shortDate, timeRange } from '../src/lib/format.ts';
import { PHOTO_META, PHOTO_NAMES } from '../src/lib/photo-meta.ts';
import { DataFileError, parseEvents, parseSite, parseTeam } from '../src/lib/schema.ts';

const ROOT = join(import.meta.dirname, '..');
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const headshots = readdirSync(join(ROOT, 'src/assets/team'))
  .filter((f) => f.endsWith('.webp'))
  .map((f) => f.replace(/\.webp$/, ''));
const flyers = readdirSync(join(ROOT, 'src/assets/flyers')).map((f) => f.replace(/\.[a-z]+$/i, ''));
const assets = { photos: PHOTO_NAMES as string[], headshots, flyers };

function failsWith(fn: () => unknown, ...fragments: string[]) {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof DataFileError, `expected a DataFileError, got ${err}`);
    for (const f of fragments) assert.ok(err.message.includes(f), `message should mention "${f}":\n${err.message}`);
    return true;
  });
}

/* ── the real files ─────────────────────────────────────────────────── */

test('events.yaml is valid', () => {
  const ev = parseEvents(read('src/data/events.yaml'), assets);
  assert.ok(ev.upcoming.length > 0);
  for (const e of ev.upcoming) assert.match(e.link ?? '', /^https:\/\/wichita\.campuslabs\.com\/engage\/event\/\d+$/, `${e.title} ${e.date} link`);
  const keys = ev.upcoming.map((e) => `${e.date} ${e.start} ${e.title}`);
  assert.equal(new Set(keys).size, keys.length, 'an event is listed twice');
  assert.ok(ev.past.some((e) => e.title === 'Chocolathon' && e.link === '/chocolathon'));
  assert.ok(ev.past.some((e) => e.title === 'Open Agent Hackathon 2026' && e.role === 'partner' && e.flyer === 'open-agent-hackathon-2026'));
  const newman = ev.upcoming.find((e) => e.date === '2026-10-21')!;
  assert.equal(newman.place, 'Groover Labs, Wichita');
  assert.match(newman.rsvp ?? '', /^https:\/\/forms\.cloud\.microsoft\/pages\/responsepage\.aspx\?id=/);
  assert.equal(ev.upcoming.find((e) => e.title === 'AI Club Meeting: AI 101')?.rsvp, 'https://forms.cloud.microsoft/r/KR7fqdkLj0');
  const names = ev.speakers.flatMap((g) => g.speakers.map((s) => s.name));
  assert.ok(names.includes('Shane Vithana') && !names.includes('Shan Vithana'));
  assert.ok(!JSON.stringify(ev).includes('225'), 'keep the room general: Woolsey Hall, not a room number');
});

test('team.yaml is valid and every listed headshot exists', () => {
  const team = parseTeam(read('src/data/team.yaml'), assets);
  const people = team.groups.flatMap((g) => g.people);
  assert.ok(people.length >= 20);
  for (const p of people) if (p.photo) assert.ok(headshots.includes(p.photo));
  assert.deepEqual(
    team.groups.map((g) => g.name),
    ['Founders', 'Executive board', 'Marketing & media', 'Events & technology', 'Faculty advisor', 'Industry advisory board'],
  );
  const shane = people.filter((p) => p.name === 'Shane Vithana');
  assert.equal(shane.length, 2, 'Shane Vithana is listed as Technical Consultant and on the advisory board');
  const board = team.groups.find((g) => /advisory/i.test(g.name))!.people;
  assert.deepEqual(
    board.map((p) => p.name),
    ['Dylan Thiessen', 'Grant Johnson', 'Nic Wentling', 'Ramsey Jamoul', 'Fareeha Amber Ansari', 'Jessica Hinel', 'Shane Vithana'],
  );
  for (const p of board) {
    assert.ok(p.photo && headshots.includes(p.photo), `${p.name} has a headshot`);
    assert.ok(p.bio && p.bio.split(/\s+/).length <= 24, `${p.name} has a one-line bio`);
    assert.ok(p.linkedin, `${p.name} has a LinkedIn link`);
  }
  assert.match(read('src/data/team.yaml'), /# Sources?: https:\/\/exploration\.org\//, 'bios cite their sources');
});

test('site.yaml is valid', () => {
  const site = parseSite(read('src/data/site.yaml'));
  assert.equal(site.contact_email, 'aiclub@wichita.edu');
  assert.equal(site.links.shockersync, 'https://wichita.campuslabs.com/engage/organization/aiclub');
  assert.equal(site.links.groupme, 'https://groupme.com/join_group/117942519/FoekrrGF');
  assert.equal(site.links.email_list, 'https://forms.cloud.microsoft/r/SJ8WYc9kxx');
  assert.equal(site.links.instagram, 'https://www.instagram.com/wsuaiclub/');
  assert.equal(site.links.linkedin, 'https://www.linkedin.com/company/wsu-ai-club/');
});

test('every photo has alt text and a file, and every file is listed', () => {
  const files = readdirSync(join(ROOT, 'src/assets/photos')).filter((f) => f.endsWith('.jpg'));
  for (const name of PHOTO_NAMES) {
    assert.ok(existsSync(join(ROOT, 'src/assets/photos', `${name}.jpg`)), `${name}.jpg is missing`);
    assert.ok(PHOTO_META[name].alt.length > 30, `${name} needs real alt text`);
    assert.match(PHOTO_META[name].focus, /^\d{1,3}% \d{1,3}%$/);
  }
  for (const f of files) assert.ok(PHOTO_NAMES.includes(f.replace(/\.jpg$/, '') as never), `${f} has no entry in photo-meta.ts`);
});

/* ── bad edits fail loudly and clearly ──────────────────────────────── */

const good = `upcoming:
  - title: AI Club Meeting
    date: 2026-10-14
    start: "5:00 PM"
    end: "7:00 PM"
    place: Woolsey Hall
    type: meeting
`;

test('a date written the wrong way names the event and the fix', () => {
  failsWith(() => parseEvents(good.replace('2026-10-14', 'Oct 14'), assets), 'events.yaml', 'upcoming #1', 'AI Club Meeting', 'date must be written like 2026-10-14');
});

test('an impossible date fails', () => {
  failsWith(() => parseEvents(good.replace('2026-10-14', '2026-02-30'), assets), 'not a real calendar date');
});

test('a time without AM/PM fails', () => {
  failsWith(() => parseEvents(good.replace('"5:00 PM"', '"17:00"'), assets), 'upcoming #1', 'start', '"5:00 PM"');
});

test('an end time before the start fails', () => {
  failsWith(() => parseEvents(good.replace('"7:00 PM"', '"4:00 PM"'), assets), 'end time must be later');
});

test('a misspelled field is caught', () => {
  failsWith(() => parseEvents(good.replace('place:', 'room:'), assets), 'unknown field "room"', 'place is missing');
});

test('an unknown event type lists the allowed ones', () => {
  failsWith(() => parseEvents(good.replace('type: meeting', 'type: party'), assets), 'type must be one of', 'build-night');
});

test('broken YAML reports the line', () => {
  failsWith(() => parseEvents(`upcoming:\n  - title: x\n   date: 2026-10-14\n`, assets), 'line');
});

test('a past event photo that does not exist is caught', () => {
  failsWith(
    () => parseEvents(`past:\n  - title: X\n    type: hackathon\n    role: host\n    photo: no-such-photo\n`, assets),
    'past #1',
    'no photo named "no-such-photo"',
  );
});

test('a headshot that does not exist is caught', () => {
  failsWith(
    () => parseTeam(`groups:\n  - name: Founders\n    people:\n      - name: A Person\n        photo: nobody\n`, assets),
    'groups #1 ("Founders") > people #1 ("A Person") > photo',
    'initials tile',
  );
});

test('a LinkedIn link must be a full address', () => {
  failsWith(
    () => parseTeam(`groups:\n  - name: Founders\n    people:\n      - name: A Person\n        linkedin: linkedin.com/in/someone\n`, assets),
    'linkedin must be a full https://www.linkedin.com/',
  );
});

test('blank optional fields are fine', () => {
  const t = parseTeam(`groups:\n  - name: Founders\n    people:\n      - name: A Person\n        role:\n        linkedin: ""\n        photo:\n`, assets);
  assert.equal(t.groups[0].people[0].role, undefined);
  assert.equal(t.groups[0].people[0].photo, undefined);
});

test('a site link without https fails', () => {
  const site = read('src/data/site.yaml').replace('groupme: https://', 'groupme: http://');
  failsWith(() => parseSite(site), 'links.groupme must start with https://');
});

test('an unknown field in site.yaml fails', () => {
  failsWith(() => parseSite(`${read('src/data/site.yaml')}
stats:
  term: Spring
`), 'unknown field "stats"');
});

test('a flyer that does not exist is caught', () => {
  failsWith(() => parseEvents(`${good}    flyer: no-such-flyer
`, assets), 'upcoming #1', 'no flyer named "no-such-flyer"');
});

test('an RSVP link must be a full https address', () => {
  failsWith(() => parseEvents(`${good}    rsvp: forms.cloud.microsoft/r/x
`, assets), 'rsvp must start with https://');
});

test('an unknown team field is caught (homeOrder was retired in round 8)', () => {
  failsWith(() => parseTeam(`homeOrder:
  - A Person
groups:
  - name: Founders
    people:
      - name: A Person
`, assets), 'unknown field "homeOrder"');
});

/* ── formatting ─────────────────────────────────────────────────────── */

test('times convert to Central, across the end of daylight saving time', () => {
  assert.equal(isoAt('2026-10-14', 17 * 60), '2026-10-14T17:00:00-05:00');
  assert.equal(isoAt('2026-11-04', 17 * 60), '2026-11-04T17:00:00-06:00');
  // ShockerSync lists the Oct 14 meeting at 22:00 UTC: 5:00 PM in Wichita.
  assert.equal(Date.parse(isoAt('2026-10-14', 17 * 60)), Date.parse('2026-10-14T22:00:00Z'));
  assert.equal(Date.parse(isoAt('2026-11-04', 17 * 60)), Date.parse('2026-11-04T23:00:00Z'));
});

test('dates, ranges and initials read the way the guide writes them', () => {
  assert.equal(shortDate('2026-10-14'), 'Wed, Oct 14');
  assert.equal(longDate('2026-09-19'), 'Sep 19, 2026');
  assert.equal(timeRange('5:00 PM', '7:00 PM'), '5:00–7:00 PM');
  assert.equal(timeRange('10:30 AM', '1:30 PM'), '10:30 AM–1:30 PM');
  assert.equal(initials('Dr. Murtaza Nasir'), 'MN');
  assert.equal(initials('Eniola (Zadok) Olaobaju'), 'EO');
  assert.equal(initials('Jeena Moore-Kirby'), 'JM');
});
