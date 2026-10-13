/**
 * Loads and validates the officer-edited YAML files at build time, and shapes
 * them for the pages. Validation lives in ./schema.ts (shared with npm test).
 */
import type { ImageMetadata } from 'astro';
import eventsSource from '../data/events.yaml?raw';
import siteSource from '../data/site.yaml?raw';
import teamSource from '../data/team.yaml?raw';
import { PHOTO_NAMES, type PhotoName } from './photo-meta.ts';
import { clockToMinutes, formatDate, isoAt, shortDate, timeRange, todayInWichita } from './format.ts';
import { parseEvents, parseSite, parseTeam, type PastEvent, type Person, type UpcomingEvent } from './schema.ts';

export { initials, longDate, shortDate } from './format.ts';

const fileName = (p: string) => p.split('/').pop()!.replace(/\.[a-z]+$/i, '');

export const PHOTOS = Object.fromEntries(
  Object.entries(import.meta.glob<ImageMetadata>('../assets/photos/*.jpg', { eager: true, import: 'default' })).map(([p, m]) => [fileName(p), m]),
) as Record<PhotoName, ImageMetadata>;

export const HEADSHOTS: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(import.meta.glob<ImageMetadata>('../assets/team/*.webp', { eager: true, import: 'default' })).map(([p, m]) => [fileName(p), m]),
);

export const FLYERS: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(import.meta.glob<ImageMetadata>('../assets/flyers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })).map(([p, m]) => [
    fileName(p),
    m,
  ]),
);

for (const name of PHOTO_NAMES) {
  if (!PHOTOS[name]) throw new Error(`src/lib/photo-meta.ts lists "${name}" but src/assets/photos/${name}.jpg is missing.`);
}

const assets = { photos: PHOTO_NAMES as string[], headshots: Object.keys(HEADSHOTS), flyers: Object.keys(FLYERS) };

export const site = parseSite(siteSource);
export const events = parseEvents(eventsSource, assets);
export const team = parseTeam(teamSource, assets);

export type EventView = UpcomingEvent & {
  dateLabel: string;
  weekday: string;
  month: string;
  day: string;
  timeLabel: string;
  startsAt: string;
  endsAt: string;
};

export function toView(e: UpcomingEvent): EventView {
  const startMin = clockToMinutes(e.start);
  const endMin = e.end ? clockToMinutes(e.end) : startMin + 120;
  return {
    ...e,
    dateLabel: shortDate(e.date),
    weekday: formatDate(e.date, { weekday: 'short' }),
    month: formatDate(e.date, { month: 'short' }),
    day: formatDate(e.date, { day: 'numeric' }),
    timeLabel: timeRange(e.start, e.end),
    startsAt: isoAt(e.date, startMin),
    endsAt: isoAt(e.date, endMin),
  };
}

/** Events dated today or later at build time, soonest first. */
export function upcomingEvents(now = new Date()): EventView[] {
  const today = todayInWichita(now);
  return events.upcoming
    .filter((e) => e.date >= today)
    .map(toView)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title));
}

export const pastEvents: PastEvent[] = events.past;

/* ── team helpers ──────────────────────────────────────────────────── */

const officerGroups = (g: { name: string }) => !/faculty|advis/i.test(g.name);

export const teamCounts = {
  officers: team.groups.filter(officerGroups).reduce((n, g) => n + g.people.length, 0),
  advisors: team.groups.find((g) => /advisory/i.test(g.name))?.people.length ?? 0,
  faculty: team.groups.find((g) => /faculty/i.test(g.name))?.people.length ?? 0,
};

/** The student leaders on the home page, in team.yaml > homeOrder (all officers if it is missing). */
const officers = team.groups.filter(officerGroups).flatMap((g) => g.people);
export const homeLeaders: Person[] = team.homeOrder
  ? team.homeOrder.map((n) => officers.find((p) => p.name === n) ?? team.groups.flatMap((g) => g.people).find((p) => p.name === n)!)
  : officers;

/** The industry advisory board, in team.yaml order (also the /advisory-board page). */
export const advisoryBoard = team.groups.find((g) => /advisory/i.test(g.name));
