/**
 * Formatting helpers: event dates and times (always Wichita, Central time)
 * and initials for team tiles.
 * Pure module so `npm test` can check it directly.
 */
export const TIME_ZONE = 'America/Chicago';

/** Minutes after midnight for "5:00 PM". NaN if the format is wrong. */
export function clockToMinutes(t: string): number {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t);
  if (!m) return NaN;
  let h = Number(m[1]) % 12;
  if (m[3] === 'PM') h += 12;
  return h * 60 + Number(m[2]);
}

/** Today's date in Wichita, as YYYY-MM-DD. */
export function todayInWichita(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** UTC offset in Wichita on a date, like "-05:00" (CDT) or "-06:00" (CST). */
export function offsetOn(date: string): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T18:00:00Z`))
    .find((p) => p.type === 'timeZoneName')!.value;
  return part.replace('GMT', '') || '+00:00';
}

/** ISO 8601 timestamp for a local Wichita date and minutes after midnight. */
export function isoAt(date: string, minutes: number): string {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${date}T${hh}:${mm}:00${offsetOn(date)}`;
}

const noonUtc = (date: string) => new Date(`${date}T12:00:00Z`);
export const formatDate = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(noonUtc(date));

/** "Wed, Oct 14" */
export const shortDate = (date: string) => formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' });
/** "Sep 19, 2026" */
export const longDate = (date: string) => formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' });

/** "5:00–7:00 PM", "10:30 AM–1:30 PM" or "5:00 PM" */
export function timeRange(start: string, end?: string): string {
  if (!end) return start;
  const [s, sp] = start.split(' ');
  const [e, ep] = end.split(' ');
  return sp === ep ? `${s}–${e} ${ep}` : `${start}–${end}`;
}

/** Two-letter initials for an initials tile: "Dr. Murtaza Nasir" -> "MN". */
export function initials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, ' ')
    .replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}
