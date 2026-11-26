import { steps } from '@/lib/content';
import AutoVideo from './AutoVideo';

/**
 * Pinned (400vh) section: left column scrolls through the steps while a ring of cards rotates
 * on the right. All motion comes from IX2 action list a-165 (adapted to four steps in lib/stages.ts).
 */
export default function Stages() {
  return (
    <section section-color="white" className="section is-cases-new">
      <div section-color="white" data-w-id="be24b132-7907-2a09-561b-a870a5aa1003" className="height-cases">
        <div className="cases-sticky-wrap">
          <div className="case--new-heading-wrap _2">
            <div className="case--new-heading">
              <h2 className="case-heading set-1 bl-steps-title">{steps.title}</h2>
              <div className="case-heading-new-botr">
                <div className="b1 max-w-37-5 bl-steps-sub">{steps.sub}</div>
              </div>
            </div>
          </div>
          <div className="cards-cases">
            <div id="w-node-_3a4ad7ca-d3c0-815a-bda5-036e7aa442cd-222670d1" className="cards-cases-left">
              <div className="cards-cases-left-wrap">
                {steps.items.map((s, i) => (
                  <div key={s.title} className={`cases-cards-left-item${i === 0 ? ' first' : i === 1 ? ' second' : ''}`}>
                    <h3 className="cases-cards-left-item-heading"><span className="bl-step-num">{s.n}</span>{s.title}</h3>
                    <div className="cases-cards-left-item-text-wrap">
                      <div className="cases-cards-left-item-text">{s.text}</div>
                    </div>
                    <a href="#book-a-demo" className="nav_link-c contact grey _2 hide w-inline-block">
                      <div className="btn-text opacity-90">{steps.cta}</div>
                      <div className="explode violet" />
                    </a>
                  </div>
                ))}
              </div>
              <div className="top-gradient" />
              <div className="top-gradient-copy" />
            </div>
            <div className="cards-cases-right">
              <div className="rotate-cards-flexbox-2">
                <div className="rotate-ellipse-2">
                  <div className="rotate-card-2 card-1" />
                  {steps.items.map((s, i) => (
                    <div key={s.title} className={`rotate-card-2 card-${i + 2}`}>
                      <AutoVideo lazy className={`case-rotate-img set-${i + 1}`} src={s.video} poster={s.poster} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="case-mob-wrap">
              {steps.items.map((s, i) => (
                <div key={s.title} className="case-mob-home">
                  <div className="case-mob-home-img-block">
                    <AutoVideo lazy className="mob-case-home-img" src={s.video} poster={s.poster} />
                  </div>
                  <div className="card-case-bot-item">
                    <div className="card-case-bot-item-heading"><span className="bl-step-num">{s.n}</span>{s.title}</div>
                    <div className="card-case-bot-item-text">{s.text}</div>
                    <a href="#book-a-demo" className="nav_link-c contact grey _2 w-inline-block">
                      <div className="btn-text opacity-90">{steps.cta}</div>
                      <div className="explode violet" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
