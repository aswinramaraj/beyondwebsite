import { hero, showreel, heroWidgets } from '@/lib/content';
import AutoVideo from './AutoVideo';

const IDENT = 'translate3d(0, 0vh, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)';
const TAG_GLOW = 'translate3d(-18%, 2%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)';

/** Floating UI cards around the headline (positions/sizes/parallax come from the original CSS + IX2). Each plays a looping motion graphic; the phone twins show its still frame. */
function Widget({ set, media, ratio, round, extra, still }: { set: number; media: { video: string; poster: string }; ratio: string; round?: boolean; extra?: string; still?: boolean }) {
  return (
    <div className={`hero-paralax set-${set} bl-widget ${round ? 'is-round' : ''} ${extra || ''}`} style={{ aspectRatio: ratio }}>
      {still ? <img src={media.poster} alt="" loading="lazy" /> : <AutoVideo lazy className="bl-widget-video" src={media.video} poster={media.poster} />}
    </div>
  );
}

export default function Hero() {
  return (
    <div section-color="white" data-w-id="1218a009-69e9-a08b-f66c-3ae591f8231a" style={{ opacity: 0 }} className="hero-height-new">
      <section id="top" section-color="white" data-w-id="8579ced5-bb5c-a59c-9a98-4b378ead2465" className="section hero home">
        <div data-w-id="b4f76b9d-153b-b1cf-8480-9fa8af99da1a" style={{ transform: IDENT }} className="container is-big full">
          <div className="hero-heading">
            <div data-w-id="6d1332f8-3212-0ba2-8e33-ec01b8e03f28" className="hero-tag-wrap">
              <div className="hero-tag">
                <div className="tag-text">{hero.tag}</div>
              </div>
              <div style={{ transform: TAG_GLOW }} className="stats-card-gradient services hero-home" />
            </div>
            <div className="hero-home-heading-wrap">
              <h1 className="heading-hero">{hero.title}</h1>
            </div>
          </div>
          <div className="show-wrap">
            <div className="showreal-home">
              <div className="lap-top-bg" />
              <div className="show-real-video w-embed">
                <div style={{ width: '100%', height: '100%' }} className="w-background-video w-background-video-atom">
                  <AutoVideo id="video" src={showreel.video} poster={showreel.poster} />
                </div>
              </div>
              <div className="stats-card-gradient hero-gradient" />
            </div>
          </div>
          <div className="mob-paralax">
            {/* set-2: the blue circle – a count-up ring */}
            <Widget set={2} media={heroWidgets.boost} ratio="1/1" round />
            {/* set-3: pill (was "Key features") */}
            <div className="hero-paralax set-3 bl-pill">
              <div className="bl-pill-in">
                <span className="bl-pill-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fe4a23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" /></svg>
                </span>
                <span className="bl-pill-txt">Ask the AI Agent</span>
              </div>
            </div>
            <img src="/svg/scribble-arrow.svg" loading="lazy" alt="" className="hero-paralax set-5" />
            {/* desktop widgets (hidden on mobile) */}
            <Widget set={6} media={heroWidgets.rocket} ratio="135/141" extra="hide-mob" />
            <Widget set={4} media={heroWidgets.graph} ratio="253/144" extra="hide-mob" />
            <Widget set={7} media={heroWidgets.heart} ratio="107/113" round extra="hide-mob" />
            <Widget set={1} media={heroWidgets.installs} ratio="230/171" extra="hide-mob" />
            {/* mobile/laptop twins (the original swaps Lottie → static art at ≤767px) */}
            <Widget set={6} media={heroWidgets.rocket} ratio="135/141" extra="hide-laptop" still />
            <Widget set={4} media={heroWidgets.graph} ratio="253/144" extra="hide-laptop" still />
            <Widget set={7} media={heroWidgets.heart} ratio="107/113" round extra="hide-laptop" still />
            <Widget set={1} media={heroWidgets.installs} ratio="230/171" extra="hide-laptop" still />
          </div>
        </div>
      </section>
    </div>
  );
}
