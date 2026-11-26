import { faq } from '@/lib/content';

/** Ids of the first three Webflow dropdowns – their open/close timelines (a-76 / a-77) are bound to these. */
const IDS = [
  '0ed997cc-b698-2ae3-cf52-1d06f9a53988',
  '1f714ca5-f5a4-7114-9551-240cb897faf8',
  '0ed997cc-b698-2ae3-cf52-1d06f9a53994',
];

export default function Faq() {
  return (
    <section id="faq" section-color="white" data-w-id="0ed997cc-b698-2ae3-cf52-1d06f9a53974" className="section is-faq">
      <div className="container">
        <div className="section-heading">
          <h3 className="heading-3 text-align-center text-color-white">{faq.title}</h3>
          <div data-w-id="0ed997cc-b698-2ae3-cf52-1d06f9a53979" className="shadow vertical _2" />
        </div>
        <div className="faq-wrap">
          <div id="faq-row-1" className="faq-group-row">
            {faq.items.map((it, i) => (
              <div key={it.q} data-delay="0" data-hover="false" data-w-id={IDS[i]} className="faq-dropdown dark w-dropdown">
                <div className="dropdown-toggle w-dropdown-toggle" role="button" tabIndex={0} aria-expanded="false">
                  <div className="faq-question-label label_faq_dev">{it.q}</div>
                  <div className="plus-faq" />
                  <div className="cros-wrap">
                    <div className="line-1" />
                    <div className="line-2" />
                  </div>
                </div>
                <nav className="drop-list w-dropdown-list">
                  <div className="faq-answear-drop">
                    <p className="faq-answer-p">{it.a}</p>
                  </div>
                </nav>
              </div>
            ))}
          </div>
          <div data-w-id="0ed997cc-b698-2ae3-cf52-1d06f9a53a05" className="shadow hide-mob" />
        </div>
      </div>
    </section>
  );
}
