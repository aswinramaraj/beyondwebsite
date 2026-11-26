import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import AboutMotion from '@/components/about/AboutMotion';
import { aboutPage, contact, products } from '@/lib/content';
import './about.css';

export const metadata: Metadata = {
  title: 'About | Beyondlogik',
  description: 'Beyondlogik started in 2024 building software for clients across several nations, launched Craveo in 2025, builds the EIS platform for colleges in 2026 and launches its next product in 2027.',
};

/** words as spans, so the scroll reveals can colour them one by one */
const Words = ({ text }: { text: string }) => (
  <>
    {text.split(' ').map((w, i) => (
      <span key={i} className="ab-w">{w}{' '}</span>
    ))}
  </>
);

/** "2024" → rolling digit strips (the final digit is the server-rendered state, so it reads correctly without JS) */
const Roll = ({ value }: { value: string }) => (
  <span className="ab-num" aria-label={value}>
    {value.split('').map((ch, i) =>
      /\d/.test(ch) ? (
        <span key={i} className="ab-roll" aria-hidden="true">
          <span className="ab-roll-strip" data-d={ch} style={{ transform: `translateY(-${Number(ch) * 10}%)` }}>
            {'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}
          </span>
        </span>
      ) : (
        <span key={i} className="ab-roll-sym" aria-hidden="true">{ch}</span>
      ),
    )}
  </span>
);

export default function Page() {
  const { hero, intro, stats, mission, values, studio, story, work, cta } = aboutPage;
  // what we build: the product list + EIS, Craveo (the first product) first, then by year
  const cards = [...products.items, work.eis].sort((a, b) => (a.name === 'Craveo' ? -1 : b.name === 'Craveo' ? 1 : a.year.localeCompare(b.year)));

  return (
    <div className="page-wrapper dark bl-about">
      <noscript><style>{'.ab-tile{opacity:1!important;transform:none!important}'}</style></noscript>
      <main>
        {/* 1 · hero: headline + mark, then our product visuals assemble into a grid as you scroll */}
        <section className="ab-hero" aria-labelledby="ab-title">
          <div className="ab-stage">
            <div className="ab-hero-head">
              <p className="ab-kicker">{hero.kicker}</p>
              <h1 id="ab-title" className="ab-hero-title">
                {hero.lines.map((l, i) => (
                  <span key={l} className="ab-line"><span>{l}{i < hero.lines.length - 1 ? ' ' : ''}</span></span>
                ))}
              </h1>
              <p className="ab-hero-sub">{hero.sub}</p>
            </div>
            <div className="ab-mark" aria-hidden="true">
              <img src="/img/logo-mark.png" alt="" width={386} height={401} />
            </div>
            <div className="ab-grid" aria-hidden="true">
              {hero.tiles.map((src, i) => (
                <div key={src} className="ab-tile" data-i={i}>
                  <img src={src} alt="" width={1000} height={750} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2 · story intro */}
        <section className="ab-intro">
          <h2 className="ab-h2 ab-intro-title ab-reveal"><Words text={intro.title} /></h2>
          <div className="ab-intro-cols">
            {intro.cols.map((col, i) => (
              <div key={i} className="ab-fade">
                {col.map((p) => <p key={p}>{p}</p>)}
              </div>
            ))}
          </div>
        </section>

        {/* 3 · numbers */}
        <section className="ab-stats" aria-label="Beyondlogik in numbers">
          {stats.map((s, i) => (
            <div key={s.tag} className="ab-stat ab-fade">
              <div className="ab-stat-card">
                <Roll value={s.value} />
                <span className={`ab-stat-tag is-${i}`}>{s.tag}</span>
              </div>
              <p className="ab-stat-text">{s.text}</p>
            </div>
          ))}
        </section>

        {/* 4 · mission */}
        <section className="ab-mission">
          <p className="ab-label">{mission.label}</p>
          <p className="ab-mission-text ab-reveal"><Words text={mission.text} /></p>
        </section>

        {/* 5 · values: desktop – the pills drop in one by one and stack (pinned); phones – colour cards that stack as you scroll.
            Positioning (…-pos, .ab-value-text) and animation (.ab-pill, .ab-value-p) sit on separate elements on purpose: GSAP folds a CSS
            `translate` into its own transform and leaves it behind when the desktop animation is reverted (e.g. resizing to phone width). */}
        <section className="ab-values" style={{ ['--n' as string]: values.items.length }}>
          <div className="ab-values-stage">
            <h2 className="ab-label">{values.label}</h2>
            <ol className="ab-values-list">
              {values.items.map((v, i) => (
                <li key={v.name} className={`ab-value is-${i % 4}`} style={{ ['--i' as string]: i }}>
                  <span className="ab-value-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ab-pill-pos"><span className={`ab-pill is-${i % 4}`}>{v.name}</span></span>
                  <div className="ab-value-text"><p className="ab-value-p">{v.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6 · a place for curious minds (no team photos: our own product visuals) */}
        <section className="ab-studio">
          <h2 className="ab-studio-title">
            {studio.before}{' '}
            {studio.highlight.map((w, i) => (
              <span key={w} className={`ab-hl is-${i}`}><span className="ab-hl-bg" aria-hidden="true" /><span className="ab-hl-txt">{w}</span></span>
            ))}
          </h2>
          <p className="ab-studio-text ab-fade">{studio.text}</p>
          <div className="ab-collage" aria-hidden="true">
            {[0, 1, 2].map((c) => (
              <div key={c} className={`ab-col is-${c}`}>
                {studio.tiles.filter((_, i) => i % 3 === c).map((src) => (
                  <div key={src} className="ab-ctile"><img src={src} alt="" loading="lazy" width={1000} height={750} /></div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* 7 · the story: pinned horizontal timeline */}
        <section className="ab-story" aria-labelledby="ab-story-h" style={{ ['--n' as string]: story.chapters.length }}>
          <div className="ab-story-stage">
            <div className="ab-story-head">
              <h2 id="ab-story-h" className="ab-label">{story.label}</h2>
              <ol className="ab-years" aria-label="Years">
                {story.chapters.map((c, i) => (
                  <li key={c.year}><button type="button" data-i={i} aria-current={i === 0 ? 'step' : undefined}>{c.year}</button></li>
                ))}
              </ol>
            </div>
            <div className="ab-track">
              {story.chapters.map((c) => (
                <article key={c.year} className="ab-chapter" id={`year-${c.year}`}>
                  <div className="ab-chapter-text">
                    <h3 className="ab-chapter-title">{c.title}</h3>
                    <p>{c.text}</p>
                    <div className="ab-year" aria-hidden="true">{c.year}</div>
                  </div>
                  <div className={`ab-chapter-media${c.side ? '' : ' is-single'}`}>
                    <img className="ab-chapter-main" src={c.img} alt={c.alt} loading="lazy" width={1200} height={900} />
                    {c.side && <img className="ab-chapter-side" src={c.side} alt="" loading="lazy" width={1000} height={750} />}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8 · what we build */}
        <section className="ab-work">
          <h2 className="ab-h2 ab-work-title">{work.title}</h2>
          <p className="ab-work-lead">{work.lead}</p>
          <ul className="ab-cards">
            {cards.map((p) => (
              <li key={p.name} className="ab-card">
                <h3 className="ab-card-name">{p.name}</h3>
                <span className="ab-card-line" aria-hidden="true" />
                <p className="ab-card-meta">{p.type} · {p.year}</p>
                <p className="ab-card-text">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 9 · call to action */}
        <section className="ab-cta">
          <div className="ab-cta-card ab-fade">
            <div className="ab-cta-left">
              <h2 className="ab-cta-title">{cta.title}</h2>
              <p className="ab-cta-text">{cta.text}</p>
              <div className="ab-cta-btns">
                <a href={cta.primaryHref} className="ab-btn is-primary">{cta.primary}</a>
                <a href={`mailto:${contact.email}`} className="ab-btn">{cta.secondary}</a>
              </div>
            </div>
            <div className="ab-cta-visual" aria-hidden="true">
              <img src={cta.visual} alt="" loading="lazy" width={1000} height={570} />
            </div>
          </div>
        </section>
      </main>
      <Footer base="/" />
      <AboutMotion />
    </div>
  );
}
