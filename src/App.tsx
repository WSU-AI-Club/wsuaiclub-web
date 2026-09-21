import { useEffect, useState } from 'react';
import LogoSculpture from './components/LogoSculpture';

const linkedInUrl = 'https://www.linkedin.com/company/wsu-ai-club';

export default function App() {
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
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <header className="site-header wrap">
          <a className="brand" href="#top" aria-label="AI Club, Wichita State University">
            <img src="/brand/logo-black.png" alt="AI Club, Wichita State University" />
          </a>
          <nav aria-label="Primary navigation">
            <a href="#explore">Explore</a>
            <a href="https://chocolathon.vercel.app" target="_blank" rel="noreferrer">Chocolathon <span aria-hidden="true">↗</span></a>
            <a className="nav-join" href="#join">Join the club <span aria-hidden="true">↗</span></a>
          </nav>
        </header>

        <div className="hero-grid wrap" id="top">
          <div className="hero-copy">
            <p className="eyebrow"><span className="gold-dot" /> Wichita State University</p>
            <h1 id="hero-title">Different minds.<br /><span>One new</span><br />perspective.</h1>
            <p className="tagline">People <b>×</b> ideas <b>×</b> a brighter tomorrow</p>
            <a className="button" href="#join">Find your people <span aria-hidden="true">→</span></a>
          </div>

          <div className="sculpture-column">
            <div className="sculpture-notes" aria-hidden="true">
              <span>Ideas<br />in motion</span>
              <i />
              <span>Perspective<br />brings people<br />together</span>
            </div>
            <div className="sculpture-stage">
              <LogoSculpture paused={paused} gust={gust} onEnergy={setEnergy} onReady={setReady} />
              <div className="stage-controls">
                <button
                  className="icon-button"
                  type="button"
                  disabled={!ready || reducedMotion}
                  onClick={() => setPaused((value) => !value)}
                  aria-pressed={paused}
                  aria-label={paused ? 'Resume sculpture motion' : 'Pause sculpture motion'}
                >
                  <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
                </button>
                <div className="wind-meter" aria-label={`Wind energy ${windLevel} percent`}>
                  <span>{reducedMotion ? 'Still mode' : paused ? 'Paused' : 'Live wind'}</span>
                  <i><b style={{ width: `${windLevel}%` }} /></i>
                  <em>{String(windLevel).padStart(2, '0')}</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-instruction wrap">
          <span className="instruction-label">{reducedMotion ? 'A little stillness. A new perspective.' : 'Move slowly. Then make some wind.'}</span>
          <span className="instruction-line" aria-hidden="true" />
          <button type="button" disabled={!ready || paused || reducedMotion} onClick={() => setGust((value) => value + 1)}>{reducedMotion ? 'Reduced motion' : 'Send a gust'} <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section id="explore" className="explore wrap" aria-labelledby="explore-title">
        <div className="section-lead">
          <p className="eyebrow">01 — Explore</p>
          <h2 id="explore-title">A club for people<br />who want to build.</h2>
        </div>
        <div className="explore-items">
          <article><span>01</span><h3>Learn</h3><p>Trade notes, ask better questions, and get hands-on with what’s next.</p></article>
          <article><span>02</span><h3>Make</h3><p>Turn curiosity into projects with people willing to try the first version.</p></article>
          <article><span>03</span><h3>Share</h3><p>Bring your angle. Every major and every starting point is welcome here.</p></article>
        </div>
      </section>

      <section id="join" className="join wrap" aria-labelledby="join-title">
        <p className="eyebrow"><span className="gold-dot" /> Come as you are</p>
        <div><h2 id="join-title">Every major.<br />Every starting point.</h2><p>Come curious. Bring an idea. Follow along for upcoming sessions and ways to get involved.</p></div>
        <a className="button button-gold" href={linkedInUrl} target="_blank" rel="noreferrer">Connect with the club <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="wrap"><span>© {new Date().getFullYear()} AI Club, Wichita State</span><a href={linkedInUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://chocolathon.vercel.app" target="_blank" rel="noreferrer">Chocolathon ↗</a></footer>
    </main>
  );
}
