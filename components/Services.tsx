import { modules } from '@/lib/content';
import AutoVideo from './AutoVideo';

/**
 * Card wrappers/ids mirror the original's masonry (two columns, right column offset upward).
 * Six cards (the original's six slots); every card carries its own motion-graphic video (tools/motion) in the picture slot at the bottom.
 */
const SLOTS: { wrap: string; card: string; id: string; glow: string; desc: string; glowFirst?: boolean }[] = [
  { wrap: 'card-glow', card: 'set-1', id: '9327c432-eee2-0657-eb01-f570952c3b22', glow: 'set-1', desc: '' },
  { wrap: 'card-glow', card: 'set-4', id: '37e11e59-ebd5-d47b-ea9d-28ff32111258', glow: 'set-1', desc: '_4' },
  { wrap: 'card-glow', card: 'set-2', id: '84e57622-0b7e-ccf4-d7c3-afac8d8200e3', glow: 'set-2', desc: 'big' },
  { wrap: 'card-glow set-4', card: 'set-5', id: '336f199c-c4b5-e579-bb2b-45693c0d9886', glow: 'set-2', desc: '_5' },
  { wrap: 'card-glow', card: 'set-3', id: '90c825d6-8459-ea93-9b52-82b0890cdb45', glow: 'set-3', desc: '_3' },
  // the original's sixth card: its glow comes first in the markup and the wrapper carries the right-column offset
  { wrap: 'card-glow set-6', card: 'set-6', id: 'eff56ce8-5a94-9411-61c5-ecb0aaa91946', glow: 'set-3', desc: '_3', glowFirst: true },
];

export default function Services() {
  return (
    <section id="focus" section-color="white" data-w-id="f4d214d0-6c36-9360-e2b5-d9bf4dbbc7ac" className="section is-cases">
      <div className="container is-about big-2">
        <div className="section-heading-wrap">
          <h2 className="section-name">{modules.word}</h2>
          <div data-w-id="e44d9f8a-7fe6-5877-f621-38bedc1bcf41" className="shadow vertical small" />
          <p className="b1 serv-sub max-w-40 bl-serv-sub">{modules.title}</p>
          <div className="hero-tag-wrap serv">
            <div className="hero-tag">
              <div className="tag-text">{modules.tag}</div>
            </div>
            <div className="stats-card-gradient services serv" />
          </div>
        </div>
        <div className="section-subheading-serv-home">
          <div className="verticle-line">
            <div className="stats-card-gradient services line" />
          </div>
          <div className="b1 serv-sub second bl-serv-second">{modules.intro}</div>
        </div>
        <div id="cards" className="service-card-wrap">
          {modules.items.map((m, i) => {
            const s = SLOTS[i];
            const video = <AutoVideo lazy className="bl-card-art" src={m.video} poster={m.poster} />;
            return (
              <div key={m.title} className={s.wrap}>
                {s.glowFirst && <div className={`stats-card-gradient services ${s.glow}`} />}
                <div data-w-id={s.id} className={`service-card ${s.card}`}>
                  {s.card === 'set-4' ? (
                    <div className="brand-heading">
                      <h4 className="service-card-title">{m.title}</h4>
                      <div className={`service-card-desc ${s.desc}`}>{m.text}</div>
                    </div>
                  ) : (
                    <>
                      <h4 className="service-card-title">{m.title}</h4>
                      <div className={`service-card-desc ${s.desc}`}>{m.text}</div>
                    </>
                  )}
                  {video}
                </div>
                {!s.glowFirst && <div className={`stats-card-gradient services ${s.glow}`} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
