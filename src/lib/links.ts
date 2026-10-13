import { site } from '../content/site';

/** Resolve the CTAs that depend on which links the club has supplied. */
export function studentCta() {
  const p = site.joinPage.paths.students;
  return site.joinFormUrl ? { href: site.joinFormUrl, text: p.cta } : { href: site.linkedinUrl, text: p.ctaFallback };
}
export function contactCta(kind: 'faculty' | 'community') {
  const p = site.joinPage.paths[kind];
  return site.contactEmail ? { href: `mailto:${site.contactEmail}`, text: p.cta } : { href: site.linkedinUrl, text: p.ctaFallback };
}
export function nextSessionCells() {
  const s = site.nextSession, l = site.nextSessionStrip;
  return [
    { label: l.dateLabel, value: s.date },
    { label: l.timeLabel, value: s.time },
    { label: l.roomLabel, value: s.room },
  ].filter((c) => c.value.trim());
}
