import { about } from '@/lib/content';

// the original's per-card wrapper / card classes (they position the cards and carry their scroll animation)
const WRAP = ['img-list-set-1', 'set-3', 'set-2', 'set-4'];
const CARD = ['_4', '_2', '_3', '_2 _3'];

/** Statement + four stat cards that fly in from the sides on scroll. */
export default function Stats() {
  return (
    <section id="results" section-color="white" data-w-id="bb32a1b6-2396-a007-5780-aa517848547a" className="section bg-dark cards">
      <div className="container hero margin-top-8 overflow-hidden">
        <div className="bl-about-head">
          <h2 {...({ animate: '' } as object)} className="anim-heading-home">
            {about.title}
          </h2>
          <p className="b1 max-w-37-5 bl-about-sub">{about.statement}</p>
        </div>
        <div className="hero-cards">
          {about.stats.map((st, i) => (
            <div key={st.title} {...(i === 0 ? { 'data-w-id': '1e8de970-d96f-4fe6-0a77-9ba70590e112' } : {})} className={`stats-card-wrapper ${WRAP[i]}`}>
              <div className={`stats-card ${CARD[i]} bl-stat`}>
                <span className={`bl-stat-tag is-${st.tone}`}>{st.tag}</span>
                <div className="bl-stat-main">
                  <h2 className="card-hero-heading _3">
                    {st.value}
                    {st.unit && <span className="bl-unit">{st.unit}</span>}
                  </h2>
                  <div className="bl-stat-title">{st.title}</div>
                  <div className="card-hero-desc">{st.caption}</div>
                </div>
              </div>
              <div className="stats-card-gradient" />
            </div>
          ))}
          <div className="left-stat-gradient bot" />
          <div className="left-stat-gradient top" />
          <div className="right-stat-gradient top" />
          <div className="right-stat-gradient bot" />
        </div>
        <div className="shadow vertical small-2" />
      </div>
    </section>
  );
}
