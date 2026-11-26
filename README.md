# Beyondlogik site — outcrowd.io's design and motion, Beyondlogik's content

A Next.js (App Router) rebuild of the **outcrowd.io homepage**: same layout, typography, colours, spacing, animations and
interactions, filled with Beyondlogik's text and products. Images and logos are neutral placeholders until real artwork is supplied.

```
npm install
npm run dev            # http://localhost:3100
npm run build && npm start
cd backend/sirpi && npm start   # the Sirpi contest backend (Google sign-in, problems, votes) — see backend/sirpi/README.md
```

## Decisions made for this build
| Topic | Choice |
|---|---|
| Brand | **Beyondlogik** (wordmark); the product is **Beyondlogik EIS** |
| Stack | Next.js 16 + React 19, plain CSS, GSAP 3.11.4 + ScrollTrigger, Lenis 1.0.23, SplitType (same libraries/versions as the original) |
| Palette | Outcrowd's exact tokens (`#080808` canvas, `#fe4a23` orange, `#774dff` purple, greys) |
| Sections with no source text | the blog became "Insights": 15 researched articles on recent technology (see *Insights* below); testimonials dropped (none exist, none invented); the products list ("10+ products. One team.") was removed from the home page on request |

## Where things are
```
app/            layout, page, webflow.css (original CSS, URLs made local), inline.css (the original's inline <style>), site.css (our additions)
components/     one file per section, same class names and data-w-id anchors as the original markup
                SiteHeader (top bar) · Nav (bottom dock) · Mascot (3D mascot) · MascotDemo · PlaceholderPage
lib/content.ts  ALL copy, contact details, links, product list — edit text here
lib/ix2.ts      port of the Webflow interaction engine (see below)
lib/ix2-data.json   the original's interaction data (events, timelines, durations, easings, offsets)
lib/effects.ts  ports of the original's inline scripts (Lenis, char reveals, nav, showreel, hover effects, dropdowns …)
lib/stages.ts   adapts the pinned "steps" timeline from 3 to 4 steps
lib/mascot/     the 3D mascot's controller (GLB loading, clip state machine, render loop) – see tools/mascot/README.md
lib/compensate.ts   rescales scroll timelines so effects keep their original scroll distance in pixels
public/         fonts, neutral placeholder artwork (public/placeholder), a few decorative Outcrowd graphics
tools/parity/   scripts that measure the replica against the original (see its README)
tools/motion/   the fifteen motion graphics (Focus + steps + hero widgets): source, design principles, renderer (see its README)
```

## Header, bottom dock and mascot
* **Top header** (`components/SiteHeader.tsx`, every page; it is *not* pinned — it scrolls away with the page): the **Beyondlogik wordmark image** (`public/img/logo-wordmark*.webp`) + **About · Products · Insights · Sirpi** on the left,
  **Contact** button on the right (Yali, the pet, takes off from beside it — see below). Links go to `/about`, `/products`, `/insights`, `/studio` (Sirpi is the studio; the URL stays `/studio`); Contact goes to
  `/#book-a-demo` (works from any page). The bar has no background: it checks what is behind the logo and links (including the
  actual brightness of the showreel video) and switches between the dark-text and white-text logo/links. Under 768 px it becomes
  logo + burger menu and the mascot is not loaded.
* **Bottom dock** (`components/Nav.tsx`, home page only): the original navigation bar, moved to a floating bar at the
  bottom-centre of the viewport (32 px from the bottom at 1440 px, like the reference). It has two states: **expanded** (logo · Results · Approach · Focus · FAQ · **Book a call** · **Contact**) and **compact**
  (logo · **Book a call** · **Contact**; the links fold away smoothly). On the landing screen it is always expanded. Further down it is compact,
  **expands while you scroll down**, folds back ~1 s after scrolling stops (or straight away when you scroll up), and stays open while the
  pointer is on it or one of its links has keyboard focus, so the links can be clicked (`navBehaviour()` in `lib/effects.ts`, `.is-compact` in `site.css`). The logo scrolls to the top; each link is highlighted only while
  you are inside its section; **Book a call** goes to the demo form and **Contact** to the footer's contact details. On phones the
  expanded bar hides "Approach" and "Contact" to stay compact. The bar switches between the dark and light variant by the section behind it.
* **Placeholder pages**: Products only has a title, one line and a "coming soon" tag (copy in `placeholders` in
  `lib/content.ts`) — replace it with real content later. About, Insights and Studio (Sirpi) are real pages (below).

## About page (/about)
Structure and motion follow outcrowd.io/about-us; copy is `aboutPage` in `lib/content.ts`, markup `app/about/page.tsx`, styles `app/about/about.css`,
motion `lib/about-motion.ts` (GSAP + ScrollTrigger on Lenis). Sections: **hero** (headline + logo mark; eight of our product visuals fly in and lock
into a 4 × 2 grid as you scroll) → **story intro** → **numbers** (2024 founded · 10+ products · 2027 next launch; digits roll) → **mission** (words
light up) → **values** (pills drop in and stack, text changes beside them) → **"a place for curious minds"** (highlight wipes + drifting collage) →
**the story** (pinned sideways timeline 2024 → 2025 → 2026 → 2027 with year buttons) → **what we build** (EIS + the product list, Craveo first) → **CTA**.
Client decisions: no team photos (product visuals instead), only known numbers, partner institutions not named, Craveo (2025) is the first product
(product years in `products` were corrected to match). The four **values are a draft** written from the site's own copy — confirm or replace them.
Phones and `prefers-reduced-motion` get a plain vertical layout (also the no-JS fallback); there the values become colour cards that stack as you scroll (CSS `position: sticky`). Never put a CSS `translate` on an element GSAP animates: GSAP folds it into its transform and leaves it behind when an animation is reverted (that is why the pills/texts have separate positioning wrappers). Timeline stills: `public/img/about-y2024/y2026/y2027.webp`
(`tools/motion`, `node render.mjs still y2024 y2026 y2027`); 2025 uses the Craveo Focus poster.
* **The mascot** (`components/Mascot.tsx`, model `public/fantasy_pet.min.glb`, details and API in `tools/mascot/README.md`) hovers just left of Contact, facing it.
  It takes off (Lift → Fly) when the header is on screen, does a random trick (Rotate / Backflip / Bite) every 9–14 s, spins when the pointer is over it,
  does a backflip when clicked, and **breathes fire when Contact is hovered or focused**. Honours `prefers-reduced-motion` (static poster, no download) and is
  not rendered on phones. A test page with a button per clip and a runtime check of the model's clips is at **`/mascot-demo`**.
* Sizes in the new bars use `--r` (the original's fluid rem, never below 13 px) so they stay usable on tablets.

## Studio page (/studio) — Sirpi
*Sirpi* (சிற்பி, "the one who carves") is the studio. Markup `app/studio/page.tsx`, styles `app/studio/studio.css`, behaviour
`lib/sirpi/film.ts` + `lib/sirpi/interact.ts` (booted by `components/sirpi/SirpiMotion.tsx`, cleaned up on client navigation).
Everything is scoped under `.bl-sirpi` and every class has the `sp-` prefix, so it never collides with `webflow.css` / `site.css`.
Typography follows the site: "Itcavantgardestd Md" (headings), "Itcav Bk" (text), "Itcavantgardestd Xltobl" (accent words),
"Itcavantgardestd Mdcn" (labels); Tamil and the other scripts of the footer word are Noto fonts self-hosted by `next/font`.
* **Film (layer 1)** — 1185 frames (parts 1–5: Stone → Wheel → Machine → Silicon → Sky) in `public/sirpi/frames/d` (1600 px) and `/m`
  (960 px, phones), scrubbed by scroll on a fixed canvas with story lines. Frames load progressively (a loader waits
  for the opening + a coarse pass). The Gemini watermark was removed from every frame. When the film ends it leaves faster than
  the content scrolls in (parallax); `[data-speed]` blocks inside the content lag slightly.
* **Content (layer 2)** — intro, products (an image-only showcase of Yali, Muse, Saalai and the toolbox: hover, keyboard focus or a tap opens a small detail tab; a click pins it, click outside / Esc closes), the signature pen (signs "Sirpi", then
  the visitor can pick it up and draw anywhere: *Clear ink* / *Set the pen down* / Esc), the monthly **Stupid Problem Prize**
  and a CTA (uses `contact.email`). Then the "We all are Sirpi" layer (the word cycles through "sculptor" in 18
  languages) is revealed, followed by the site footer.
* **Contest backend** — the Stupid Problem Prize (dark band: a bonfire burning on the prize money with the countdown in the flames,
  leaderboard, **See all problems & vote** dialog) talks to `backend/sirpi` through the proxy `/sirpi-api/*` (`next.config.mjs`,
  `SIRPI_API_URL`, default `http://127.0.0.1:8787`). Data is stored in **Firebase Firestore**; posting and voting need **Google sign-in**. Setup, rules and API: `backend/sirpi/README.md`.
  Only real posts are shown: without the backend the section says it is offline; without `GOOGLE_CLIENT_ID` it is read-only. Code: `lib/sirpi/contest.ts`, `lib/sirpi/bonfire.ts`.

## Yali, the pet — on every page
`components/YaliPet.tsx` (mounted in `app/layout.tsx`) + `lib/yali/roam.ts` + `app/yali.css`, using the same `<Mascot />`. It replaces the
header mascot: on every page load it takes off from beside **Contact** and roams the viewport.
* **Under the text** — it is drawn with `mix-blend-mode: multiply`, so on the white pages every glyph and edge shows through it; text drifts and
  cards nudge away as it passes (eased `translate` / `rotate`). Elements another script animates (an inline transform, a Webflow `data-w-id`,
  GSAP) are never touched — see the GSAP note in the About section.
* **Bites** — every 7–12 s it may fly to a visible button (a link/button with a solid, rounded background, plus Sirpi's vote and "+" buttons)
  and bite it: a tooth-scalloped chunk is masked out, crumbs fall, the button shakes. Up to 3 bites per button; it still works and heals after 30 s.
* **Fire** — or it breathes fire, charring the space in front of it dark for 2 s. Hovering / focusing **Contact** calls it over to breathe fire
  at the button (the header dispatches a `yali:fire-at` event; at most once per 5 s).
* Off on phones (< 768 px), with `prefers-reduced-motion` (the header then shows its static mascot poster, as before) and on `/mascot-demo`.
  `?yali` adds a test hook: `window.__yali.bite() / fire() / goto(x, y) / hold() / state()`.

## Insights (the blog)
* **Posts** are Markdown files in `content/insights/<slug>.md` (the file name is the URL: `/insights/<slug>`). Each starts with a front-matter block:
  `title`, `subtitle`, `date` (YYYY-MM-DD), `topic` (one of `AI`, `Security`, `Web`, `Tech & society`, `Frontier tech`, set in `TOPICS` in `lib/insights.ts`),
  `cover` and `coverAlt`. The body supports `##`/`###` headings, paragraphs, `-` and `1.` lists, `>` quotes, tables, **bold**, *italic*, `code` and links;
  end with a `## Sources` list (styled as the source list). Read time is computed (230 words/min). To add a post: drop in a new `.md` file and rebuild.
* **`/insights`** (`app/insights/page.tsx`, `components/insights/InsightsFeed.tsx`) — a Medium-style feed in the site theme: topic tabs and a search box
  that filter in place (kept in the URL, e.g. `/insights?topic=security&q=passkey`), rows with byline, title, subtitle, topic, date, read time,
  copy-link and a thumbnail, and a sidebar (desktop) with Editor's picks (`PICKS` in `lib/insights.ts`), topics with counts and an About note.
* **`/insights/<slug>`** (`app/insights/[slug]/page.tsx`, all pre-rendered; unknown slugs are a 404) — Medium-style article: breadcrumb, title,
  subtitle, author row, share bar (copy link, LinkedIn, X — plain links, nothing loads from those sites), wide cover, 680 px reading column,
  sources, "Written by" band and four related posts (same topic first). An orange reading-progress bar runs along the top.
* **Home** — the Insights section shows the **newest three** posts (by `date`) from the same files; each card opens its article.
* **Author** is "Beyondlogik Team" (`AUTHOR` in `lib/insights.ts`); no individual authors were invented. Styles: `app/insights/insights.css`.
* **Covers** are designed stills from the motion kit (`tools/motion/scenes.js`, `node render.mjs still <name>`), one per post.
* Set **`SITE_URL`** (e.g. `SITE_URL=https://your-domain npm run build`) so social-preview images get absolute URLs.

## Theme (white)
The site is white: `app/light.css` (loaded after `site.css`) re-colours the original dark design — white pages, `#080808` text,
`#f5f5f5` cards, orange `#fe4a23` accent; the laptop frame and the videos stay dark because they are devices/footage.
To get the original dark theme back, remove `import './light.css'` from `app/layout.tsx` and set the sections'
`section-color` attributes back to `"black"` (the bottom dock reads them to pick its colours).

## Placeholders to replace
* **Images** — every picture slot uses a neutral tile from `public/placeholder/` (`tile-*.svg`, `logo.svg`): hero widgets, stat
  cards, steps ring, module cards, blog covers and the four partner-logo cards. Drop real artwork into those slots.
* **Contact, social and legal links** — placeholders in `lib/content.ts` (`contact`, `social`, `legal`).

## How the motion is reproduced exactly
Every animation on outcrowd.io is stored as data inside its Webflow bundle (433 events / 162 timelines). That data was
extracted (parsed with a JS parser, never executed) into `lib/ix2-data.json`, and `lib/ix2.ts` replays it with the
engine's own maths: per-frame smoothing `pos += (target − pos) · max(1 − smoothing, .01)`, hold-before-first-keyframe,
keyframe interpolation with the original easings, scroll-progress `(vh − top)/(vh + height)`, sequential action groups,
delays, loops, `SCROLL_INTO_VIEW` firing rules, hover / click / dropdown triggers. Elements keep the original class names
and `data-w-id` ids so the data binds without changes.

Measured against the live original (headless Chrome, 1440 px): **3,014 sampled animation values at 22 scroll positions
match within tolerance (100 %)**; layout geometry matches at 1280 / 1440 / 1920 px (119 of 120 values identical, the
last fixed afterwards); hover, footer-link flip and FAQ open/close timelines match; the preloader runs the same phases.

## Spacing
Margins, paddings and gaps come from the original's own CSS, so they are identical. The hero, steps heading, services,
CTA and footer sections measure the same height as the original (within 1 px). What differs is block *height* where there is
less text or fewer items: 3 FAQ items instead of 11, and the "Beyond the classroom" block (3 pillars) where the original had 6 case studies.
Where real text could fill an original slot (services header, steps sub-line, footer columns, logo cards) it was sized
to the original's line counts. Re-check any time with `tools/parity/spacing.mjs`.

## Content-driven differences (unavoidable)
* **Fewer / different items** — 3 FAQ items instead of 11, 4 steps instead of 3, and no
  awards/products list. Timelines are re-timed so each effect plays over the same scroll distance
  (`lib/compensate.ts`, `lib/stages.ts`); the pinned steps section is taller (560 vh) for the extra step.
* **Artwork** — the original's Lottie widgets/screenshots belong to Outcrowd and its clients, so neutral placeholder tiles
  (`public/placeholder`) fill the same boxes; swap in real artwork there. The logo is a text wordmark (its hover/preloader reveal is driven by the same timeline value
  the Lottie logo used).
* **Videos** — the hero **showreel** (laptop frame; grows to full width on scroll with the original thresholds) is Outcrowd's own
  footage (`public/video/showreel-home.mp4`; it contains their logo and clients such as Fundex and Monex), so treat it as a stand-in
  and replace it with Beyondlogik footage before launch (path in `lib/content.ts`). The six **Focus** card videos, the four **steps** videos (the rotating cards and the mobile list of the 4-step section) and the five
  floating **hero widgets** (heart pulse, rocket over bars, growing graph, changing-value bars, count-up circle; phones get their still frames)
  are original motion graphics made for this site (`public/video/focus-*.mp4`, `step-*.mp4`, `hero-*.mp4`; the 15 Insights covers are stills, `public/img/insight-*.webp`; source and design rules in `tools/motion/`).
* **Dock width** — sized by its content (the original hard-codes widths for its short labels), so longer labels never clip.

## Things to review before launch
* **Fonts** — *ITC Avant Garde Gothic Std* (in `public/fonts`) is a commercial typeface. Licence it, or replace it
  (closest free clone: TeX Gyre Adventor) by editing the `@font-face` block at the top of `app/webflow.css`.
* **Contact data** — address, email, phone, social and legal links are **placeholders** (`contact`, `social`, `legal` in `lib/content.ts`); fill in the real ones.
* **Demo form** — posts JSON to `NEXT_PUBLIC_DEMO_FORM_ENDPOINT` if set; otherwise opens a pre-filled email. Add a backend/endpoint for production.
* **Decorative Outcrowd graphics** kept as neutral assets: light-beam image, arrows, 3 social icons, scribble arrow, CTA glow, 4 leaf sprites.
* The original's custom cursor discs are dead code on outcrowd.io (never shown) and are intentionally not reproduced.
