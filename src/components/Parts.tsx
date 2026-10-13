import type { ReactNode } from 'react';
import { site } from '../content/site';
import { Link } from '../lib/router';
import { nextSessionCells } from '../lib/links';

export function Spark() {
  return <span className="spark" aria-hidden="true" />;
}

export function Eyebrow({ children, spark = false }: { children: ReactNode; spark?: boolean }) {
  return (
    <p className="eyebrow">
      {spark && <Spark />}
      {children}
    </p>
  );
}

export function DataStrip({ cells, label }: { cells: { label: string; value: string }[]; label?: string }) {
  if (!cells.length) return null;
  return (
    <dl className="data-strip" aria-label={label}>
      {cells.map((cell) => (
        <div key={cell.label}>
          <dt>{cell.label}</dt>
          <dd>{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Renders nothing unless the club has filled in nextSession. */
export function NextSession({ ground = 'paper' }: { ground?: 'paper' | 'ink' }) {
  const cells = nextSessionCells();
  if (!cells.length) return null;
  return (
    <section className={`band ${ground}`} aria-label={site.nextSessionStrip.eyebrow}>
      <div className="wrap">
        <Eyebrow>{site.nextSessionStrip.eyebrow}</Eyebrow>
        <DataStrip cells={cells} label={site.nextSessionStrip.eyebrow} />
      </div>
    </section>
  );
}

export function Header() {
  return (
    <header className="site-header paper">
      <div className="wrap header-row">
        <Link className="brand" href="/" aria-label={site.nav.logoAlt}>
          <img src="/brand/lockup-horizontal-black.svg" alt={site.nav.logoAlt} width="160" height="58" />
        </Link>
        <nav aria-label="Primary">
          <Link href="/#what">{site.nav.what}</Link>
          <a href="/chocolathon">{site.nav.chocolathon}</a>
          <Link className="button primary" href="/join">
            {site.nav.join}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const f = site.footer;
  const links: { href: string; text: string; external?: boolean }[] = [
    { href: site.linkedinUrl, text: f.linkedin, external: true },
    { href: site.instagramUrl, text: f.instagram, external: true },
    { href: site.discordUrl, text: f.discord, external: true },
    { href: site.contactEmail ? `mailto:${site.contactEmail}` : '', text: f.email },
    { href: site.codeOfConductUrl, text: f.conduct, external: true },
  ].filter((l) => l.href);
  return (
    <footer className="site-footer ink">
      <div className="wrap">
        <div className="footer-top">
          <Link href="/" aria-label={site.nav.logoAlt}>
            <img src="/brand/lockup-horizontal-reversed.svg" alt={site.nav.logoAlt} width="140" height="51" />
          </Link>
          <ul className="footer-links">
            {links.map((l) => (
              <li key={l.text}>
                <a href={l.href} {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-bottom">
          <p>{f.credit}</p>
          <p className="mono-note">
            © {new Date().getFullYear()} {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
