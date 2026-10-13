/**
 * Schemas for the three files officers edit: src/data/events.yaml,
 * src/data/team.yaml and src/data/site.yaml.
 *
 * Both the site build and `npm test` run these. A bad edit (a typo in a field
 * name, a date like "Oct 14", a photo that does not exist) stops the build
 * with a message that names the file, the entry and the fix, so the live site
 * keeps the last good version.
 *
 * Pure module: no Astro imports, so Node's test runner can load it directly.
 */
import { parseDocument } from 'yaml';
import { z } from 'zod';
import { clockToMinutes } from './format.ts';

/* ── shared pieces ──────────────────────────────────────────────────── */

const text = (what: string) =>
  z.string({ error: `${what} is missing or is not text` }).trim().min(1, { error: `${what} is empty` });

/** An optional field: a missing key, an empty value (`role:`) and "" all mean "not set". */
const blank = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === null || (typeof v === 'string' && v.trim() === '') ? undefined : v), schema.optional());

const optionalText = blank(z.string({ error: 'must be text' }).trim());

const isoDate = z
  .string({ error: 'date must be written like 2026-10-14' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'date must be written like 2026-10-14 (year-month-day)' })
  .refine((v) => !Number.isNaN(Date.parse(`${v}T12:00:00Z`)) && new Date(`${v}T12:00:00Z`).toISOString().startsWith(v), {
    error: 'date is not a real calendar date',
  });

const clock = z
  .string({ error: 'time must be written like "5:00 PM" (in quotes)' })
  .trim()
  .regex(/^(1[0-2]|[1-9]):[0-5]\d (AM|PM)$/, { error: 'time must be written like "5:00 PM" or "10:30 AM"' });

const link = z
  .string({ error: 'link must be text' })
  .trim()
  .refine((v) => /^https:\/\/[^\s]+$/.test(v) || /^\/[a-z0-9/-]*$/.test(v), {
    error: 'link must start with https:// (or be a page on this site, like /chocolathon)',
  });

const httpsUrl = (what: string) =>
  z.string({ error: `${what} is missing` }).trim().regex(/^https:\/\/[^\s]+$/, { error: `${what} must start with https://` });

const email = z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, { error: 'not a valid email address' });

/* ── events.yaml ────────────────────────────────────────────────────── */

export const EVENT_TYPES = ['meeting', 'workshop', 'speaker', 'build-night', 'hackathon', 'social', 'tabling', 'other'] as const;

const eventType = z.enum(EVENT_TYPES, { error: `type must be one of: ${EVENT_TYPES.join(', ')}` });

const upcomingEvent = z
  .strictObject({
    title: text('title'),
    date: isoDate,
    start: clock,
    end: blank(clock),
    place: text('place'),
    type: eventType,
    link: blank(link),
    note: optionalText,
    ledBy: optionalText,
    partner: optionalText,
    rsvp: blank(httpsUrl('rsvp')),
    rsvpLabel: optionalText,
    flyer: optionalText,
    flyerAlt: optionalText,
  })
  .refine((e) => !e.end || clockToMinutes(e.end) > clockToMinutes(e.start), {
    error: 'end time must be later than the start time',
    path: ['end'],
  });

const fact = z.strictObject({ label: text('label'), value: text('value') });

const pastEvent = z.strictObject({
  title: text('title'),
  date: blank(isoDate),
  place: optionalText,
  type: eventType,
  role: z.enum(['host', 'partner'], { error: 'role must be host or partner' }),
  blurb: optionalText,
  photo: optionalText,
  photos: z.array(z.string().trim().min(1)).optional(),
  flyer: optionalText,
  flyerAlt: optionalText,
  link: blank(link),
  linkLabel: optionalText,
  facts: z.array(fact).max(4, { error: 'use at most 4 facts' }).optional(),
});

const linkedinUrl = blank(
  z
    .string()
    .trim()
    .regex(/^https:\/\/(www\.)?linkedin\.com\/[^\s]+$/, { error: 'linkedin must be a full https://www.linkedin.com/... address' }),
);

const speaker = z.strictObject({ name: text('name'), role: optionalText, linkedin: linkedinUrl, photo: optionalText });

const speakerGroup = z.strictObject({
  group: text('group'),
  speakers: z.array(speaker).min(1, { error: 'list at least one speaker' }),
});

export const eventsSchema = z.strictObject({
  upcoming: z.array(upcomingEvent).nullish().transform((v) => v ?? []),
  past: z.array(pastEvent).nullish().transform((v) => v ?? []),
  speakers: z.array(speakerGroup).nullish().transform((v) => v ?? []),
});

/* ── team.yaml ──────────────────────────────────────────────────────── */

const person = z.strictObject({
  name: text('name'),
  role: optionalText,
  linkedin: blank(
    z
      .string()
      .trim()
      .regex(/^https:\/\/(www\.)?linkedin\.com\/[^\s]+$/, { error: 'linkedin must be a full https://www.linkedin.com/... address' }),
  ),
  photo: optionalText,
});

export const teamSchema = z.strictObject({
  homeOrder: z.array(text('a name in homeOrder')).optional(),
  groups: z
    .array(
      z.strictObject({
        name: text('name'),
        note: optionalText,
        people: z.array(person).min(1, { error: 'a group needs at least one person' }),
      }),
    )
    .min(1, { error: 'list at least one group' }),
});

/* ── site.yaml ──────────────────────────────────────────────────────── */

export const siteSchema = z.strictObject({
  contact_email: email,
  links: z.strictObject({
    shockersync: httpsUrl('links.shockersync'),
    shockersync_events: httpsUrl('links.shockersync_events'),
    groupme: httpsUrl('links.groupme'),
    email_list: httpsUrl('links.email_list'),
    instagram: httpsUrl('links.instagram'),
    linkedin: httpsUrl('links.linkedin'),
  }),
  meeting: z.strictObject({
    day: text('meeting.day'),
    time: text('meeting.time'),
    place: text('meeting.place'),
  }),
  partners: z
    .array(
      z.strictObject({
        name: text('name'),
        kind: text('kind'),
        link: blank(link),
      }),
    )
    .min(1),
});

export type EventsData = z.output<typeof eventsSchema>;
export type UpcomingEvent = EventsData['upcoming'][number];
export type PastEvent = EventsData['past'][number];
export type TeamData = z.output<typeof teamSchema>;
export type Person = TeamData['groups'][number]['people'][number];
export type SiteData = z.output<typeof siteSchema>;

/* ── parsing with readable errors ───────────────────────────────────── */

export class DataFileError extends Error {
  constructor(file: string, problems: string[]) {
    super(
      `\n\n${file} has ${problems.length === 1 ? 'a problem' : `${problems.length} problems`}:\n` +
        problems.map((p) => `  - ${p}`).join('\n') +
        `\n\nFix ${problems.length === 1 ? 'it' : 'them'} in ${file} and commit again. The live site keeps the last good version until then.\n`,
    );
    this.name = 'DataFileError';
  }
}

function describePath(root: unknown, path: PropertyKey[]): string {
  // e.g. upcoming #3 ("AI Club Meeting", 2026-10-28) > start
  const parts: string[] = [];
  let node: unknown = root;
  for (const key of path) {
    if (typeof key === 'number') {
      const item = Array.isArray(node) ? node[key] : undefined;
      const label =
        item && typeof item === 'object'
          ? [(item as Record<string, unknown>).title ?? (item as Record<string, unknown>).name ?? (item as Record<string, unknown>).group, (item as Record<string, unknown>).date]
              .filter((v) => typeof v === 'string')
              .join(', ')
          : '';
      parts.push(`#${key + 1}${label ? ` ("${label}")` : ''}`);
    } else parts.push(String(key));
    node = node && typeof node === 'object' ? (node as Record<PropertyKey, unknown>)[key as string] : undefined;
  }
  return parts.join(' > ').replace(/ > #/g, ' #') || '(top of the file)';
}

function parseYaml(file: string, source: string): unknown {
  const doc = parseDocument(source, { prettyErrors: true, uniqueKeys: true });
  if (doc.errors.length) {
    throw new DataFileError(
      file,
      doc.errors.map((e) => {
        const at = e.linePos?.[0] ? `line ${e.linePos[0].line}, column ${e.linePos[0].col}: ` : '';
        return `${at}${e.message.split('\n')[0]} (check the indentation and that text with a colon is in quotes)`;
      }),
    );
  }
  return doc.toJS();
}

function validate<S extends z.ZodType>(file: string, schema: S, data: unknown, extra?: (v: z.output<S>) => string[]): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => {
      const where = describePath(data, issue.path);
      if (issue.code === 'unrecognized_keys') {
        return `${where}: unknown field ${issue.keys.map((k) => `"${k}"`).join(', ')} (check the spelling; allowed fields are listed at the top of the file)`;
      }
      return `${where}: ${issue.message}`;
    });
    throw new DataFileError(file, problems);
  }
  const more = extra?.(result.data) ?? [];
  if (more.length) throw new DataFileError(file, more);
  return result.data;
}

export type Assets = { photos: string[]; headshots: string[]; flyers?: string[] };

export function parseEvents(source: string, assets: Assets, file = 'src/data/events.yaml'): EventsData {
  const flyers = assets.flyers ?? [];
  const noFlyer = (where: string, name: string) =>
    `${where} > flyer: there is no flyer named "${name}" in src/assets/flyers. Use one of: ${flyers.join(', ') || '(none yet)'}`;
  const noPhoto = (where: string, name: string) => `${where} > photo: there is no photo named "${name}". Use one of: ${assets.photos.join(', ')}`;
  return validate(file, eventsSchema, parseYaml(file, source), (d) => [
    ...d.upcoming.flatMap((e, i) => (e.flyer && !flyers.includes(e.flyer) ? [noFlyer(`upcoming #${i + 1} ("${e.title}", ${e.date})`, e.flyer)] : [])),
    ...d.past.flatMap((e, i) => {
      const where = `past #${i + 1} ("${e.title}")`;
      return [
        ...(e.photo && !assets.photos.includes(e.photo) ? [noPhoto(where, e.photo)] : []),
        ...(e.photos ?? []).filter((p) => !assets.photos.includes(p)).map((p) => noPhoto(`${where} > photos`, p)),
        ...(e.flyer && !flyers.includes(e.flyer) ? [noFlyer(where, e.flyer)] : []),
      ];
    }),
    ...d.speakers.flatMap((g, gi) =>
      g.speakers.flatMap((s, si) =>
        s.photo && !assets.photos.includes(s.photo) ? [noPhoto(`speakers #${gi + 1} ("${g.group}") > speakers #${si + 1} ("${s.name}")`, s.photo)] : [],
      ),
    ),
  ]);
}

export function parseTeam(source: string, assets: Assets, file = 'src/data/team.yaml'): TeamData {
  return validate(file, teamSchema, parseYaml(file, source), (d) => {
    const names = new Set(d.groups.flatMap((g) => g.people.map((p) => p.name)));
    return [
      ...d.groups.flatMap((g, gi) =>
        g.people.flatMap((p, pi) =>
          p.photo && !assets.headshots.includes(p.photo)
            ? [
                `groups #${gi + 1} ("${g.name}") > people #${pi + 1} ("${p.name}") > photo: there is no headshot named "${p.photo}" in src/assets/team. Leave photo empty for an initials tile.`,
              ]
            : [],
        ),
      ),
      ...(d.homeOrder ?? [])
        .filter((n) => !names.has(n))
        .map((n) => `homeOrder: "${n}" is not anyone listed under groups. Spell the name exactly as it appears in a group.`),
    ];
  });
}

export function parseSite(source: string, file = 'src/data/site.yaml'): SiteData {
  return validate(file, siteSchema, parseYaml(file, source));
}
