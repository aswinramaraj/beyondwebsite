import type { Metadata } from 'next';
import { Noto_Sans_Tamil, Noto_Sans_Devanagari, Noto_Sans_Telugu, Noto_Sans_Malayalam, Noto_Sans_Kannada, Noto_Sans_Bengali, Noto_Sans_Arabic } from 'next/font/google';
import Footer from '@/components/Footer';
import SirpiMotion from '@/components/sirpi/SirpiMotion';
import { contact } from '@/lib/content';
import './studio.css';

export const metadata: Metadata = {
  title: 'Sirpi Studio | Beyondlogik',
  description: 'Sirpi (சிற்பி, “the one who carves”) is the Beyondlogik studio: Yali, our own LLM; Muse; Saalai, the highway companion; small tools; and a monthly Stupid Problem Prize.',
};

/* Scripts for the rotating "We all are Sirpi" word, the Tamil names and the Yali glyph field.
   next/font self-hosts them at build time, so visitors' browsers never contact Google. */
const tamil = Noto_Sans_Tamil({ subsets: ['tamil'], weight: 'variable', variable: '--sp-tamil', display: 'swap' });
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: 'variable', variable: '--sp-deva', display: 'swap', preload: false });
const telugu = Noto_Sans_Telugu({ subsets: ['telugu'], weight: 'variable', variable: '--sp-telugu', display: 'swap', preload: false });
const malayalam = Noto_Sans_Malayalam({ subsets: ['malayalam'], weight: 'variable', variable: '--sp-malayalam', display: 'swap', preload: false });
const kannada = Noto_Sans_Kannada({ subsets: ['kannada'], weight: 'variable', variable: '--sp-kannada', display: 'swap', preload: false });
const bengali = Noto_Sans_Bengali({ subsets: ['bengali'], weight: 'variable', variable: '--sp-bengali', display: 'swap', preload: false });
const arabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: 'variable', variable: '--sp-arabic', display: 'swap', preload: false });
const fontVars = [tamil, deva, telugu, malayalam, kannada, bengali, arabic].map((f) => f.variable).join(' ');

/**
 * /studio — Sirpi, the Beyondlogik studio.
 * Layer 1: a 1185-frame film (parts 1–5) scrubbed by scroll, with story beats; it leaves faster than layer 2 arrives (parallax).
 * Layer 2: intro → products (image showcase) → signature pen → monthly contest → CTA.
 * Then the "We all are Sirpi" background layer is revealed, followed by the site footer.
 * Static markup lives here; all behaviour is in lib/sirpi (booted by SirpiMotion after hydration).
 */
export default function Page() {
  return (
    <div className={`bl-sirpi ${fontVars}`}>
      {/* Loader */}
      <div className="sp-loader" id="sp-loader" aria-hidden="true">
        <div className="sp-loader__word">சிற்பி</div>
        <div className="sp-loader__bar"><span id="sp-loaderBar"></span></div>
        <div className="sp-loader__pct sp-mono"><span id="sp-loaderPct">0</span>% · carving</div>
      </div>

      {/* LAYER 1 — the film (scroll-scrubbed frames). Moves faster than layer 2. */}
      <div className="sp-film" id="sp-film" aria-hidden="true">
        <canvas id="sp-filmCanvas"></canvas>
        <div className="sp-film__vignette"></div>
      </div>

      {/* Hero scroll track: drives the frame sequence */}
      <section className="sp-hero" id="sp-top">
        <div className="sp-hero__sticky">
          <div className="sp-beat sp-beat--title" data-in="0" data-out="0.06">
            <p className="sp-eyebrow sp-mono">சிற்பி · (n.) the one who carves</p>
            <h1 className="sp-hero__word">Sirpi</h1>
            <p className="sp-hero__sub">A studio that carves solutions for the real world.</p>
          </div>

          {/* Story beats: data-in/out are fractions of the whole film.            Part boundaries: 1 → 0–.25 · 2 → .25–.49 · 3 → .49–.73 · 4 → .73–.97 · 5 → .97–1 */}
          <div className="sp-beat sp-beat--right" data-in="0.07" data-out="0.23">
            <p className="sp-eyebrow sp-mono">01 — stone</p>
            <h2>Every tool began with a <em>problem</em> someone refused to ignore.</h2>
          </div>

          <div className="sp-beat sp-beat--left" data-in="0.28" data-out="0.47">
            <p className="sp-eyebrow sp-mono">02 — wheel</p>
            <h2>The stone became an axe. The axe became a wheel. <em>The wheel moved the world.</em></h2>
          </div>

          <div className="sp-beat sp-beat--right" data-in="0.52" data-out="0.71">
            <p className="sp-eyebrow sp-mono">03 — machine</p>
            <h2>Gears, steam, the printing press — <em>and then, light.</em></h2>
          </div>

          <div className="sp-beat sp-beat--left" data-in="0.76" data-out="0.95">
            <p className="sp-eyebrow sp-mono">04 — silicon</p>
            <h2>Steel bridges. Silicon chips. <em>A ladder to the sky.</em></h2>
          </div>

          <div className="sp-beat sp-beat--center" data-in="0.985" data-out="1.06">
            <p className="sp-eyebrow sp-mono">05 — sky</p>
            <h2>Every era has its sculptors.<br /><em>This one is ours.</em></h2>
          </div>

        </div>
      </section>

      {/* LAYER 2 — content. Slides in beneath the film, slower. */}
      <main className="sp-layer2" id="sp-layer2">

        <section className="sp-intro">
          <p className="sp-eyebrow sp-mono">Studio · Est. in the real world</p>
          <h2 className="sp-intro__lead" data-speed="0.08">
            We don’t pick problems by industry.<br />
            We pick the ones that <em>keep people up at night</em> — then carve until they’re gone.
          </h2>
          <div className="sp-marquee" aria-hidden="true">
            <div className="sp-marquee__track">
              <span>Language</span><i>✦</i><span>Mobility</span><i>✦</i><span>Creativity</span><i>✦</i><span>Film</span><i>✦</i><span>Cities</span><i>✦</i><span>Learning</span><i>✦</i><span>Commerce</span><i>✦</i>
              <span>Language</span><i>✦</i><span>Mobility</span><i>✦</i><span>Creativity</span><i>✦</i><span>Film</span><i>✦</i><span>Cities</span><i>✦</i><span>Learning</span><i>✦</i><span>Commerce</span><i>✦</i>
            </div>
          </div>
        </section>

        {/* PRODUCTS — image-only showcase: hover, focus or tap a tile to open its detail tab */}
        <section className="sp-products" id="sp-work">
          <header className="sp-products__head">
            <p className="sp-eyebrow sp-mono">What we’re carving · 04 products · hover or tap a project</p>
            <h2>Things we’ve <em>carved.</em></h2>
          </header>

          <div className="sp-gallery">
            <article className="sp-show sp-show--a" data-speed="0.04">
              <button type="button" className="sp-show__hit" aria-expanded="false" aria-controls="sp-tab-yali" aria-label="Yali: show details" />
              <div className="sp-pvis sp-pvis--yali" aria-hidden="true">
                <div className="sp-glyphs" id="sp-glyphs"></div>
                <div className="sp-yali__mark">யாளி</div>
              </div>
              <span className="sp-show__n sp-mono" aria-hidden="true">01</span>
              <span className="sp-show__plus" aria-hidden="true" />
              <div className="sp-show__tab" id="sp-tab-yali" role="region" aria-label="Yali">
                <p className="sp-show__kind sp-mono">Our own LLM</p>
                <h3>Yali <span className="sp-native">யாளி</span></h3>
                <p className="sp-show__desc">Our own large language model, named after the guardian beast carved into every South Indian temple pillar. It thinks in the languages people actually speak, not only English.</p>
                <ul className="sp-tags sp-mono"><li>Multilingual</li><li>Built in-house</li><li>Private by default</li></ul>
              </div>
            </article>
            <article className="sp-show sp-show--b" data-speed="0.1">
              <button type="button" className="sp-show__hit" aria-expanded="false" aria-controls="sp-tab-muse" aria-label="Muse: show details" />
              <div className="sp-pvis sp-pvis--muse" aria-hidden="true">
                <span className="sp-orb sp-orb--a"></span><span className="sp-orb sp-orb--b"></span><span className="sp-orb sp-orb--c"></span>
                <p className="sp-muse__q" id="sp-museQ">“What if the moon<br />ran a bakery?”</p>
              </div>
              <span className="sp-show__n sp-mono" aria-hidden="true">02</span>
              <span className="sp-show__plus" aria-hidden="true" />
              <div className="sp-show__tab" id="sp-tab-muse" role="region" aria-label="Muse">
                <p className="sp-show__kind sp-mono">Creative companion</p>
                <h3>Muse</h3>
                <p className="sp-show__desc">Wonder on demand. Muse turns a half-formed spark into a story, a sketch or a song, and asks the questions that get you unstuck.</p>
                <ul className="sp-tags sp-mono"><li>Stories</li><li>Sketches</li><li>Sound</li></ul>
              </div>
            </article>
            <article className="sp-show sp-show--c" data-speed="0.07">
              <button type="button" className="sp-show__hit" aria-expanded="false" aria-controls="sp-tab-saalai" aria-label="Saalai: show details" />
              <div className="sp-pvis sp-pvis--saalai" aria-hidden="true">
                <svg className="sp-road" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
                <defs><linearGradient id="sp-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef0f3"/><stop offset=".35" stopColor="#eef0f3" stopOpacity="0"/></linearGradient></defs>
                <path d="M170 0 L230 0 L400 500 L0 500 Z" className="sp-road__tar"/>
                <path d="M200 0 L200 500" className="sp-road__dash"/>
                <path d="M172 0 L4 500 M228 0 L396 500" className="sp-road__edge"/>
                <rect width="400" height="500" fill="url(#sp-fade)"/>
                </svg>
                <ul className="sp-stops sp-mono">
                <li><i className="sp-ic sp-ic--toll"></i><span>Toll plazas</span><b>with charges</b></li>
                <li><i className="sp-ic sp-ic--food"></i><span>Food stops</span><b>veg &amp; non-veg</b></li>
                <li><i className="sp-ic sp-ic--fuel"></i><span>Fuel &amp; EV chargers</span><b>on your route</b></li>
                <li><i className="sp-ic sp-ic--wc"></i><span>Clean restrooms</span><b>on your route</b></li>
                <li><i className="sp-ic sp-ic--med"></i><span>Hospitals</span><b>nearest first</b></li>
                </ul>
              </div>
              <span className="sp-show__n sp-mono" aria-hidden="true">03</span>
              <span className="sp-show__plus" aria-hidden="true" />
              <div className="sp-show__tab" id="sp-tab-saalai" role="region" aria-label="Saalai">
                <p className="sp-show__kind sp-mono">Highway companion</p>
                <h3>Saalai <span className="sp-native">சாலை</span></h3>
                <p className="sp-show__desc">See everything on the highway before you reach it: toll plazas and their charges, food stops worth stopping for, fuel and EV chargers, clean restrooms and hospitals, all along your route.</p>
                <ul className="sp-tags sp-mono"><li>Tolls</li><li>Food stops</li><li>Fuel · EV</li><li>Restrooms</li></ul>
              </div>
            </article>
            <article className="sp-show sp-show--d" data-speed="0.02">
              <button type="button" className="sp-show__hit" aria-expanded="false" aria-controls="sp-tab-tools" aria-label="The toolbox: show details" />
              <div className="sp-pvis sp-pvis--tools" aria-hidden="true">
                <div className="sp-tool sp-tool--unmark">
                <div className="sp-unmark__img">
                <svg className="sp-unmark__scene" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice"><circle cx="290" cy="70" r="26" fill="#fe4a23" opacity=".9"/><path d="M0 200 L0 140 L70 90 L120 130 L190 70 L260 140 L320 105 L400 150 L400 200 Z" fill="#b8c0cc"/><path d="M0 200 L0 170 L90 135 L170 165 L250 140 L330 170 L400 160 L400 200 Z" fill="#8e98a6"/></svg>
                <span className="sp-unmark__spark">✦</span><span className="sp-unmark__scan"></span>
                <span className="sp-unmark__tag sp-mono">before → after</span>
                </div>
                <p className="sp-mono">Unmark · image &amp; video</p>
                </div>
                <div className="sp-tool sp-tool--hush">
                <div className="sp-hush__wave" id="sp-hushWave"></div>
                <p className="sp-mono">Hush · phone noise-cancel</p>
                </div>
              </div>
              <span className="sp-show__n sp-mono" aria-hidden="true">04</span>
              <span className="sp-show__plus" aria-hidden="true" />
              <div className="sp-show__tab" id="sp-tab-tools" role="region" aria-label="The toolbox">
                <p className="sp-show__kind sp-mono">Small tools</p>
                <h3>The toolbox</h3>
                <p className="sp-show__desc">Small, sharp tools for annoying everyday problems.</p>
                <ul className="sp-tools">
                <li><b>Unmark</b><span>Removes the Gemini logo from images and video, cleanly and without blurry patches.</span></li>
                <li><b>Hush</b><span>Turns your phone into a noise-cancelling shield for loud places.</span></li>
                <li><b>More soon</b><span>A new small tool whenever a small problem annoys us enough.</span></li>
                </ul>
              </div>
            </article>
          </div>
        </section>

        {/* SIGNATURE — the pen signs first, then it's yours */}
        <section className="sp-sign" id="sp-sign">
          <h2 className="sp-sign__title">Every fix we ship carries our
            <span className="sp-circled">signature.<svg viewBox="0 0 300 110" preserveAspectRatio="none"><path pathLength="1" d="M152 8 C 60 4, 6 26, 8 58 C 10 92, 96 104, 170 100 C 248 96, 296 76, 292 46 C 288 16, 210 2, 120 12"/></svg></span>
          </h2>
          <div className="sp-desk" id="sp-desk">
            <svg className="sp-desk__sig" id="sp-sig" viewBox="0 0 400 200"></svg>
            <div className="sp-cap" id="sp-cap">
              <svg viewBox="0 0 230 64"><rect x="8" y="10" width="20" height="30" rx="3" className="sp-pen__blue"/><rect x="18" y="47" width="150" height="9" rx="3" className="sp-pen__blue"/><rect x="28" y="2" width="200" height="46" rx="5" className="sp-pen__blue"/><path d="M218 9 V 41" className="sp-pen__rim"/><text x="88" y="20" className="sp-cap__txt" transform="rotate(-8 88 24)">SIGN</text><text x="88" y="31" className="sp-cap__txt" transform="rotate(-8 88 24)">YOUR</text><text x="88" y="42" className="sp-cap__txt" transform="rotate(-8 88 24)">WORK</text></svg>
            </div>
            <button className="sp-pen" id="sp-pen" type="button" aria-label="Pick up the pen and draw">
              <svg viewBox="0 0 520 64"><rect x="0" y="27" width="16" height="10" rx="2" className="sp-pen__nib"/><path d="M16 22 L64 16 L64 48 L16 42 Z" className="sp-pen__blue"/><rect x="64" y="10" width="20" height="44" rx="3" className="sp-pen__blue"/><rect x="84" y="5" width="400" height="54" rx="5" className="sp-pen__blue"/><rect x="484" y="10" width="26" height="44" rx="4" className="sp-pen__blue"/><path d="M96 16 H 470" className="sp-pen__hi"/></svg>
            </button>
            <p className="sp-desk__hint sp-mono" id="sp-deskHint">Click the pen. Sign it yourself.</p>
          </div>
        </section>

        {/* CONTEST — the monthly Stupid Problem Prize (dark band). Data, Google sign-in and votes: backend/sirpi via /sirpi-api. */}
        <section className="sp-contest" id="sp-contest" data-yali-tone="dark">
          <div className="sp-contest__grid">
            <div className="sp-contest__intro">
              <p className="sp-eyebrow sp-mono">Monthly · Sirpi Open</p>
              <h2>The Stupid Problem <em>Prize.</em></h2>
              <p className="sp-contest__lede">Every month we ask for the silliest problem the crowd keeps creating: the honking that fixes nothing, the queue nobody needed. You post it, everyone votes, and we build a fix for the winner, free.</p>
              <ol className="sp-rules">
                <li><span><b>Sign in</b> with Google, so every vote is one real person.</span></li>
                <li><span><b>Post</b> a stupid problem caused by all of us, or <b>vote</b> for the ones that make you sigh the loudest.</span></li>
                <li><span><b>We carve it.</b> When the fire burns out at the end of the month, the top problem wins and we build the fix.</span></li>
              </ol>
              <div className="sp-account" id="sp-account" aria-live="polite"></div>
            </div>

            {/* the prize money holds up the bonfire; the countdown burns in it */}
            <div className="sp-bonfire" id="sp-bonfire">
              <div className="sp-bonfire__head">
                <p className="sp-mono"><span id="sp-contestMonth">This month</span><br />closes in</p>
                <p className="sp-bonfire__prize"><span className="sp-mono">Prize pool</span><b id="sp-prize">to be announced</b></p>
              </div>
              <canvas className="sp-bonfire__fire" id="sp-fire" aria-hidden="true"></canvas>
              <div className="sp-bonfire__count" id="sp-clock" role="timer" aria-label="Time left in this month’s contest">
                <span><b>00</b><i>days</i></span><span><b>00</b><i>hrs</i></span><span><b>00</b><i>min</i></span><span><b>00</b><i>sec</i></span>
              </div>
              <svg className="sp-bonfire__money" viewBox="0 0 420 130" aria-hidden="true">
                <defs>
                  <linearGradient id="sp-note" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd0a0" /><stop offset=".5" stopColor="#5a9e6d" /><stop offset="1" stopColor="#2f5f3c" /></linearGradient>
                  <linearGradient id="sp-coin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#c98a1e" /></linearGradient>
                </defs>
                {/* rolled banknotes, crossed like logs */}
                <g transform="rotate(-14 210 80)"><rect x="70" y="62" width="280" height="34" rx="17" fill="url(#sp-note)" /><ellipse cx="350" cy="79" rx="9" ry="17" fill="#2f5f3c" /><ellipse cx="350" cy="79" rx="5" ry="11" fill="#8fd0a0" /><text x="200" y="85" className="sp-note__txt">₹</text></g>
                <g transform="rotate(14 210 80)"><rect x="70" y="62" width="280" height="34" rx="17" fill="url(#sp-note)" /><ellipse cx="70" cy="79" rx="9" ry="17" fill="#2f5f3c" /><ellipse cx="70" cy="79" rx="5" ry="11" fill="#8fd0a0" /><text x="240" y="85" className="sp-note__txt">₹</text></g>
                {/* coin stacks */}
                {[[40, 112, 4], [92, 118, 6], [318, 118, 5], [372, 112, 3], [150, 122, 2], [262, 122, 3]].map(([cx, cy, n], i) => (
                  <g key={i}>{Array.from({ length: n }, (_, k) => (
                    <g key={k}><ellipse cx={cx} cy={cy - k * 6 + 3} rx="22" ry="7" fill="#a86f12" /><ellipse cx={cx} cy={cy - k * 6} rx="22" ry="7" fill="url(#sp-coin)" stroke="#8a5a0c" strokeWidth="0.8" /></g>
                  ))}</g>
                ))}
              </svg>
              <p className="sp-bonfire__stats sp-mono"><b id="sp-statProblems">0</b> problems · <b id="sp-statVotes">0</b> votes</p>
            </div>

            <form className="sp-entry" id="sp-entryForm">
              <label className="sp-mono" htmlFor="sp-entryText">What’s the stupid problem?</label>
              <textarea id="sp-entryText" maxLength={160} rows={3} required placeholder="e.g. Everyone stops right at the top of the escalator to check their phone."></textarea>
              <div className="sp-entry__row">
                <input id="sp-entryWhere" maxLength={40} placeholder="Where? (city, place)" />
                <button className="sp-btn sp-btn--small" type="submit">Post <span>↗</span></button>
              </div>
              <p className="sp-entry__note sp-mono" id="sp-entryNote">Sign in with Google to post · up to 3 problems a month</p>
            </form>

            <div className="sp-contest__board">
              <p className="sp-board__label sp-mono"><span>Leaderboard · top 5</span><span id="sp-boardNote"></span></p>
              <ol className="sp-board" id="sp-board"></ol>
              <button type="button" className="sp-btn sp-btn--all" id="sp-allBtn">See all problems &amp; vote <span id="sp-allCount"></span> <span aria-hidden="true">→</span></button>
            </div>
          </div>

          <dialog className="sp-dialog sp-all" id="sp-all" aria-labelledby="sp-allTitle">
            <div className="sp-all__head">
              <h3 id="sp-allTitle">All problems <span className="sp-mono" id="sp-allMonth"></span></h3>
              <button type="button" className="sp-dialog__x" data-close aria-label="Close">×</button>
            </div>
            <div className="sp-all__tools">
              <div className="sp-tabs" role="tablist" aria-label="Sort">
                <button type="button" role="tab" aria-selected="true" data-sort="top">Most votes</button>
                <button type="button" role="tab" aria-selected="false" data-sort="new">Newest</button>
              </div>
              <input type="search" id="sp-allSearch" placeholder="Search problems or places" aria-label="Search problems" />
            </div>
            <ol className="sp-board sp-all__list" id="sp-allList"></ol>
            <p className="sp-all__empty sp-mono" id="sp-allEmpty" hidden>No problems here yet. Be the first to post one.</p>
            <button type="button" className="sp-all__more" id="sp-allMore" hidden>Load more</button>
          </dialog>

          <dialog className="sp-dialog sp-login" id="sp-login" aria-labelledby="sp-loginTitle">
            <button type="button" className="sp-dialog__x" data-close aria-label="Close">×</button>
            <h3 id="sp-loginTitle">Sign in to <span id="sp-loginWhy">vote</span></h3>
            <p className="sp-login__lede">One Google account, one vote per problem. Only your first name, last initial and photo appear next to what you post.</p>
            <div className="sp-login__google" id="sp-gbtn"></div>
            <p className="sp-login__msg sp-mono" id="sp-loginMsg" role="status"></p>
          </dialog>
          <div className="sp-toast" id="sp-toast" role="status" aria-live="polite"></div>
        </section>


        <section className="sp-cta" id="sp-contact">
          <p className="sp-eyebrow sp-mono">Got a stone?</p>
          <h2>Bring us a problem.<br /><em>We’ll find what’s inside it.</em></h2>
          <a className="sp-btn" href={`mailto:${contact.email}`}>{contact.email} <span>↗</span></a>
        </section>
      </main>

      {/* Footer — background layer revealed as layer 2 scrolls away */}
      <footer className="sp-footer" id="sp-footer">
        <div className="sp-footer__bg" id="sp-footerBg">
          <span className="sp-footer__we">We all are</span>
          <span className="sp-footer__word" id="sp-sirpiWord" aria-live="off">Sirpi</span>
          <span className="sp-footer__lang sp-mono" id="sp-sirpiLang">Tamil · transliterated</span>
        </div>
      </footer>

      {/* Pen mode: ink layer + pen cursor + toolbar */}
      <canvas className="sp-ink" id="sp-ink" aria-hidden="true"></canvas>
      <div className="sp-pen-cursor" id="sp-penCursor" aria-hidden="true"></div>
      <div className="sp-penbar" id="sp-penBar" role="toolbar" aria-label="Pen tools">
        <button type="button" id="sp-clearInk">Clear ink</button>
        <button type="button" id="sp-setPen" className="sp-is-primary">Set the pen down</button>
      </div>

      

      <div className="sp-grain" aria-hidden="true" />

      <div className="sp-site-footer">
        <Footer base="/" />
      </div>
      <SirpiMotion />
    </div>
  );
}
