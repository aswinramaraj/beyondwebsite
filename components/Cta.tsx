import { cta, demo, steps } from '@/lib/content';
import DemoForm from './DemoForm';

export default function Cta() {
  return (
    <section id="book-a-demo" section-color="white" data-w-id="505a594f-6be9-46a4-c000-a940fb77655c" className="section is-cta">
      <div className="container is-cta">
        <div data-w-id="87fb7b75-2f9f-4817-13e4-566ea0f8bfae" className="cta-wrap">
          <div data-w-id="f515b4c4-2fcd-4d20-0746-26efdc8bb300" className="cta-card-wrapper">
            <div className="cta-card">
              <div className="cta-left">
                <h2 className="cta-heading bl-cta-heading">{demo.title}</h2>
                <div className="b1 grey text-ailng-left max-w-29">{demo.lead}</div>
                <div className="cta-btn-wrap">
                  <a href="#bl-first-name" className="nav_link-cta orange w-inline-block" data-bl-focus="first">
                    <div className="bg-btn">
                      <div className="btn-text">{cta.primary}</div>
                    </div>
                    <div className="explode violet" />
                  </a>
                  <a href="#bl-first-name" className="nav_link-cta violet" data-bl-focus="first">
                    <div className="btn-text">{steps.cta}</div>
                    <div className="explode violet" />
                  </a>
                </div>
              </div>
              <div className="cta-right">
                <DemoForm />
              </div>
            </div>
            <div className="stats-card-gradient _2" />
          </div>
        </div>
      </div>
    </section>
  );
}
