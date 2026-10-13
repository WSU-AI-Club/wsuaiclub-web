import { lazy, Suspense, useEffect, useState } from 'react';
import { site } from '../content/site';
import { Link } from '../lib/router';
import { DataStrip, Eyebrow, NextSession } from '../components/Parts';

// three.js stays out of the main chunk; text and buttons never wait on WebGL.
const LogoSculpture = lazy(() => import('../components/LogoSculpture'));

function StaticMark({ loading }: { loading?: boolean }) {
  return (
    <div className="sculpture-fallback">
      <img src="/brand/mark-black.svg" alt="" />
      {loading && <span>{site.hero.loading}</span>}
    </div>
  );
}

function Hero() {
  const h = site.hero;
  const [paused, setPaused] = useState(false);
  const [gust, setGust] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const windLevel = Math.max(0, Math.min(100, Math.round(energy * 100)));

  return (
    <section className="hero band paper" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <Eyebrow spark>{h.eyebrow}</Eyebrow>
          <h1 id="hero-title" className="display">
            {h.headline}
          </h1>
          <p className="lede">{h.lede}</p>
          <div className="actions">
            <Link className="button primary" href="/join">
              {h.primary}
            </Link>
            <Link className="button secondary" href="/#what">
              {h.secondary}
            </Link>
          </div>
        </div>

        <div className="sculpture-column">
          <div className="sculpture-stage" aria-label={h.stageLabel}>
            <Suspense fallback={<StaticMark loading />}>
              <LogoSculpture paused={paused} gust={gust} onEnergy={setEnergy} onReady={setReady} />
            </Suspense>
            <div className="stage-controls">
              <button
                className="icon-button"
                type="button"
                disabled={!ready || reducedMotion}
                onClick={() => setPaused((v) => !v)}
                aria-pressed={paused}
                aria-label={paused ? h.resume : h.pause}
              >
                <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
              </button>
              <div className="wind-meter" aria-label={`Wind energy ${windLevel} percent`}>
                <span>{reducedMotion ? h.windStill : paused ? h.windPaused : h.windLive}</span>
                <i>
                  <b style={{ width: `${windLevel}%` }} />
                </i>
                <em>{String(windLevel).padStart(2, '0')}</em>
              </div>
            </div>
          </div>
          <div className="hero-instruction">
            <span className="instruction-label">{reducedMotion ? h.instructionReduced : h.instruction}</span>
            <span className="instruction-line" aria-hidden="true" />
            <button type="button" disabled={!ready || paused || reducedMotion} onClick={() => setGust((v) => v + 1)}>
              {reducedMotion ? h.gustReduced : h.gust}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function What() {
  const w = site.what;
  return (
    <>
      <section id={w.id} className="band paper" aria-labelledby="what-title">
        <div className="wrap split">
          <div>
            <Eyebrow>{w.eyebrow}</Eyebrow>
            <h2 id="what-title" className="headline">
              {w.headline}
            </h2>
          </div>
          <p className="lede">{w.lede}</p>
        </div>
      </section>
      {w.rows.map((row) => (
        <section key={row.eyebrow} className={`band row ${row.ground}`} aria-label={row.eyebrow}>
          <div className="wrap split row-grid">
            <Eyebrow>{row.eyebrow}</Eyebrow>
            <div>
              <h3 className="title">{row.title}</h3>
              <p className="body">{row.body}</p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

function Chocolathon() {
  const c = site.chocolathon;
  return (
    <section className="band ink" aria-labelledby="choc-title">
      <div className="wrap">
        <Eyebrow spark>{c.eyebrow}</Eyebrow>
        <h2 id="choc-title" className="headline">
          {c.headline}
        </h2>
        <p className="body measure">{c.body}</p>
        <DataStrip cells={c.data} label={c.eyebrow} />
        <p className="actions">
          <a className="button secondary" href="/chocolathon">
            {c.link}
          </a>
        </p>
        <p className="body-small credit">{c.credit}</p>
      </div>
    </section>
  );
}

function JoinBand() {
  const j = site.joinBand;
  return (
    <section className="band paper" aria-labelledby="join-title">
      <div className="wrap split">
        <div>
          <Eyebrow>{j.eyebrow}</Eyebrow>
          <h2 id="join-title" className="headline">
            {j.headline}
          </h2>
          <p className="body measure">{j.body}</p>
        </div>
        <p className="actions end">
          <Link className="button primary" href="/join">
            {j.cta}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <What />
      <NextSession />
      <Chocolathon />
      <JoinBand />
    </>
  );
}
