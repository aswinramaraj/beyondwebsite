import { partners, learning } from '@/lib/content';

const CARD_IDS = [
  'a30d1d8d-db64-936b-3bf3-5b9b38506c08',
  '4b4410d1-924d-4869-f42f-066305f914b6',
  '42daf8dd-b4b1-c82c-e55f-603cc3d37df8',
  '0611c4c4-fa52-5d8e-a72d-8a258677a48b',
];

/** White section: trusted-partner logo grid + "Beyond the classroom" (learning) block. */
export default function Clients() {
  const [a, b, c, d] = partners.logos;
  const card = (l: (typeof partners.logos)[number], i: number) => (
    <div key={l.name} data-w-id={CARD_IDS[i]} className="big-brand-card bl-logo-card">
      <img src={l.src} loading="lazy" alt="" className="brand-image" />
    </div>
  );
  return (
    <section id="clients" section-color="white" data-w-id="11ad2a2c-fbdb-aaaa-ff30-de545f64c698" className="section is-clients">
      <div className="container is-about client">
        <div className="big-brands-bloick">
          <div className="section-heading white">
            <h3 className="brands-heading">{partners.title}</h3>
            <div className="shadow white vert" />
          </div>
          <div className="big-brands-wrap">
            <div className="big-brands-top-grid">
              {card(a, 0)}
              {card(b, 1)}
            </div>
            <div className="big-brands-down-grid bl-down-2">
              {card(c, 2)}
              {card(d, 3)}
            </div>
          </div>
        </div>
        <div data-w-id="11ad2a2c-fbdb-aaaa-ff30-de545f64c6a5" className="startups bl-learn">
          <div className="section-heading-wrap bl-learn-title-wrap">
            <h2 className="section-name bl-learn-title">{learning.heading}</h2>
            <div className="shadow vertical small" />
          </div>
          <div className="bl-learn-head">
            <p className="bl-learn-tag">{learning.tag}</p>
            <h3 animate-2="" className="heading-3 max-w-82 color-black">
              {learning.title}
            </h3>
            <p className="bl-learn-lead">{learning.lead}</p>
          </div>
          <div className="startup-list home bl-learn-list">
            {learning.pillars.map((name, i) => (
              <div key={name} className="startup-list-item">
                <div className="bl-learn-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="startup-name">{name}</div>
                <div className="line-startup" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
