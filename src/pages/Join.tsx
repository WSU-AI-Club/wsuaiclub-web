import { site } from '../content/site';
import { contactCta, studentCta } from '../lib/links';
import { Eyebrow, NextSession } from '../components/Parts';

export default function Join() {
  const j = site.joinPage;
  const paths = [
    { ...j.paths.students, link: studentCta() },
    { ...j.paths.faculty, link: contactCta('faculty') },
    { ...j.paths.community, link: contactCta('community') },
  ];
  return (
    <>
      <section className="band paper" aria-labelledby="join-page-title">
        <div className="wrap split">
          <div>
            <Eyebrow spark>{j.eyebrow}</Eyebrow>
            <h1 id="join-page-title" className="display">
              {j.headline}
            </h1>
          </div>
          <p className="lede">{j.lede}</p>
        </div>
      </section>
      {paths.map((p, i) => (
        <section key={p.eyebrow} className={`band row ${i === 1 ? 'ink' : 'paper'}`} aria-label={p.eyebrow}>
          <div className="wrap split row-grid">
            <Eyebrow>{p.eyebrow}</Eyebrow>
            <div>
              <h2 className="title">{p.title}</h2>
              <p className="body">{p.body}</p>
              <p className="actions">
                <a className="button primary" href={p.link.href} {...(p.link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  {p.link.text}
                </a>
              </p>
            </div>
          </div>
        </section>
      ))}
      <NextSession ground="paper" />
    </>
  );
}
