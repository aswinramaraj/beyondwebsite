/**
 * All copy on the site lives here (single source of truth).
 * The brand is "Beyondlogik" and the product is "Beyondlogik EIS".
 * Contact details, address, social and legal links are PLACEHOLDERS – replace them with the real ones here.
 */
export const brand = {
  name: 'Beyondlogik',
  product: 'Beyondlogik EIS',
  year: 2026,
};

export const contact = {
  address: ['Your street address,', 'City, Country'],
  email: 'hello@beyondlogik.com',
  phone: '+00 000 000 0000',
  phoneHref: 'tel:+000000000000',
  // Where the demo form posts. Leave empty to fall back to opening a pre-filled email.
  formEndpoint: process.env.NEXT_PUBLIC_DEMO_FORM_ENDPOINT || '',
};

export const social = {
  instagram: '#',
  linkedin: '#',
  x: '#',
};

export const legal = [
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Accessibility Statement', href: '#' },
];

/** The floating in-page bar at the bottom of the home page: one link per major section (ids in the components). */
export const nav = [
  { label: 'Results', href: '#results' },
  { label: 'Approach', href: '#approach' },
  { label: 'Focus', href: '#focus' },
  { label: 'FAQ', href: '#faq' },
];

export const cta = { primary: 'Book a Demo', secondary: 'Start Your Pilot', href: '#book-a-demo' };

/** The two buttons of the floating bar (it folds down to logo + these two once the visitor is past the hero). */
export const dock = { book: 'Book a call', contact: 'Contact' };

/** The floating widgets around the hero headline: looping motion graphics (tools/motion), shown as stills on phones. */
export const heroWidgets = {
  rocket: { video: '/video/hero-rocket.mp4', poster: '/video/hero-rocket-poster.webp' },
  graph: { video: '/video/hero-graph.mp4', poster: '/video/hero-graph-poster.webp' },
  heart: { video: '/video/hero-heart.mp4', poster: '/video/hero-heart-poster.webp' },
  installs: { video: '/video/hero-installs.mp4', poster: '/video/hero-installs-poster.webp' },
  boost: { video: '/video/hero-boost.mp4', poster: '/video/hero-boost-poster.webp' },
};

export const hero = {
  tag: 'Built for makers',
  // non-breaking spaces keep the headline on three balanced lines like the original
  title: 'We build products that move the world forward.',
};

export const about = {
  // heading + paragraph above the statistics (kept to ~2 + 3 lines so the section keeps the original's proportions)
  title: 'Ideas Become Working Products, Faster',
  statement:
    'Beyondlogik takes ideas from first sketch to a working prototype, tracks every milestone and tests each build against clear criteria.',
  // Product development efficiency – figures supplied by the client. `tone` only picks the tag colour (speed = blue, efficiency = green).
  stats: [
    { value: '14', unit: 'Days', title: 'Idea to Prototype', caption: 'Average time taken to transform an idea into a working prototype.', tag: 'Development speed', tone: 'speed' },
    { value: '92%', title: 'Milestone Completion', caption: 'Percentage of planned development milestones completed.', tag: 'Execution efficiency', tone: 'efficiency' },
    { value: '2×', title: 'Faster Iterations', caption: 'Improvement in development iteration speed against your baseline.', tag: 'Iteration speed', tone: 'speed' },
    { value: '85%', title: 'Prototype Validation', caption: 'Percentage of tested prototypes meeting predefined validation criteria.', tag: 'Validation efficiency', tone: 'efficiency' },
  ],
};

export const steps = {
  // "\n" is a deliberate line break (the heading is shown on two balanced lines, like the original's)
  title: 'We think beyond\nthe obvious.',
  items: [
    { n: '01', title: 'Question everything.', text: 'We challenge assumptions and look beyond conventional answers.', video: '/video/step-question.mp4', poster: '/video/step-question-poster.webp' },
    { n: '02', title: 'Explore possibilities.', text: 'We experiment, research and discover new ways of thinking.', video: '/video/step-explore.mp4', poster: '/video/step-explore-poster.webp' },
    { n: '03', title: 'Think differently.', text: 'We connect ideas, technology and creativity to find new perspectives.', video: '/video/step-think.mp4', poster: '/video/step-think-poster.webp' },
    { n: '04', title: 'Make it happen.', text: 'We turn ambitious thinking into meaningful real-world outcomes.', video: '/video/step-make.mp4', poster: '/video/step-make-poster.webp' },
  ],
  // sub-line under the heading (the original has one there)
  sub: "A different perspective changes everything. Here's how we approach the world.",
  cta: 'Get Started',
};

/** "Focus" section: the six areas Beyondlogik builds in (titles are impact-led; each card has its own motion graphic, see tools/motion). */
export const modules = {
  word: 'Focus',
  title: 'Six areas where we build products that matter',
  intro:
    'Ordering, business software, AI, automation, transport and inclusion: 10+ products from one team, each solving a real problem. Whether it helps someone eat, work, hire, travel or belong, it moves people forward.',
  tag: '10+ products',
  items: [
    { n: 1, title: 'Feeding people', text: 'Craveo and Highway Hub let people order ahead and collect without waiting.', video: '/video/focus-feeding.mp4', poster: '/video/focus-feeding-poster.webp' },
    { n: 2, title: 'Empowering work', text: 'Calcubill, Beyondlogik ERP, Safe Exam Browser and Skill Pro run billing, operations and exams.', video: '/video/focus-work.mp4', poster: '/video/focus-work-poster.webp' },
    { n: 3, title: 'Hiring smarter', text: 'RedHander and Autocloser screen candidates and run lead campaigns with AI.', video: '/video/focus-hiring.mp4', poster: '/video/focus-hiring-poster.webp' },
    { n: 4, title: 'Moving people', text: 'GPS Tracking shows school buses live, with instant safety alerts.', video: '/video/focus-moving.mp4', poster: '/video/focus-moving-poster.webp' },
    { n: 5, title: 'Including everyone', text: 'SahaBandh and NextStep bring matchmaking and jobs to differently-abled people.', video: '/video/focus-including.mp4', poster: '/video/focus-including-poster.webp' },
    { n: 6, title: 'Automating tasks', text: 'Agentic AI plans, runs and optimizes routine tasks so teams can focus on what matters.', video: '/video/focus-automating.mp4', poster: '/video/focus-automating-poster.webp' },
  ],
  cta: 'Get Started',
};

export const partners = {
  title: 'Our Trusted Partners',
  logos: [
    { name: 'Partner logo', src: '/placeholder/logo.svg', w: 560, h: 477 },
    { name: 'Partner logo', src: '/placeholder/logo.svg', w: 560, h: 101 },
    { name: 'Partner logo', src: '/placeholder/logo.svg', w: 560, h: 215 },
    { name: 'Partner logo', src: '/placeholder/logo.svg', w: 560, h: 351 },
  ],
};

/** "Beyond the classroom" (white section, under the partner logos): text as supplied by the client. */
export const learning = {
  // the giant heading (styled and revealed like the "Focus" word); "\n" = the line break
  heading: 'Beyond the\nclassroom',
  tag: 'Learning · Experience · Growth',
  title: "Learning shouldn't stop at knowing. It should start with doing.",
  lead: 'We bring technology closer to aspiring creators through practical experiences, collaborative learning and real-world problem solving.',
  pillars: ['Practical knowledge', 'Industry-oriented challenges', 'Project-based experiences'],
};

/**
 * The hero showreel (taken from outcrowd.io: 1920×1080, 28.7 s). It is Outcrowd's own footage (it includes their logo and
 * client work) and only a stand-in: replace the files in /public/video (or these paths) with Beyondlogik footage.
 */
export const showreel = {
  video: '/video/showreel-home.mp4',
  poster: '/video/showreel-poster.webp',
};

/** NOTE: not shown on the home page any more (the "10+ products" section was removed); kept for the Products page. */
export const products = {
  title: '10+ products. One team.',
  intro: 'Beyondlogik builds products for ordering, business operations, hiring, learning and inclusion.',
  items: [
    { cat: 'Ordering', type: 'Food ordering', year: '2025', name: 'Craveo', text: 'A modern preordering system for institutions and restaurants, helping users order ahead and collect without waiting.' },
    { cat: 'Ordering', type: 'Travel', year: '2025', name: 'Highway Hub', text: 'A location-aware preordering app that helps travellers find nearby stops, place orders and stay on schedule.' },
    { cat: 'Business Software', type: 'Business ops', year: '2026', name: 'Calcubill', text: 'An all-in-one business operations platform for billing, management, reporting and daily business control.' },
    { cat: 'Business Software', type: 'ERP', year: '2025', name: 'Beyondlogik ERP', text: 'A comprehensive business management solution for coordinating operations, resources, workflows and reporting.' },
    { cat: 'Business Software', type: 'Education security', year: '2025', name: 'Safe Exam Browser', text: 'A secure, ethical browser for students that helps institutions run exams with controlled access and fair usage.' },
    { cat: 'Business Software', type: 'Skill assessment', year: '2026', name: 'Skill Pro', text: 'Evaluate and enhance skills with assessments, progress visibility and guided improvement paths.' },
    { cat: 'AI', type: 'Recruitment', year: '2026', name: 'RedHander', text: 'Recruit the right way with AI-supported hiring workflows for screening, evaluation and smarter candidate decisions.' },
    { cat: 'AI', type: 'Lead management', year: '2025', name: 'Autocloser', text: 'An AI platform that runs campaigns, calls customers and handles all of your lead management.' },
    { cat: 'Transport', type: 'School transport', year: '2026', name: 'GPS Tracking', text: 'Real-time bus tracking for schools and institutions, with live locations, pickup-to-drop-off visibility and instant safety alerts.' },
    { cat: 'Inclusion', type: 'Matrimony', year: '2025', name: 'SahaBandh', text: 'A matrimony platform designed for accessible, respectful matchmaking for differently-abled people.' },
    { cat: 'Inclusion', type: 'Jobs', year: '2025', name: 'NextStep', text: 'A job portal for differently-abled people, connecting candidates with inclusive opportunities and simpler applications.' },
  ],
};

/** "Insights" (the blog) on the home page. The posts themselves are Markdown files in content/insights (see lib/insights.ts);
 * the home section shows the newest three, the button opens the feed. */
export const insights = {
  title: 'Insights',
  href: '/insights',
  more: 'All insights',
};

export const faq = {
  title: 'Frequently Asked Questions',
  items: [
    { q: 'What are we working towards?', a: 'Our vision is to create technology that makes a meaningful difference by transforming ambitious ideas into practical innovations.' },
    { q: 'Does BeyondLogik work with educational institutions?', a: 'We are interested in working with educational institutions through collaborative learning experiences, technology initiatives and practical knowledge sharing.' },
    { q: 'How can I be part of the journey?', a: "Connect with us, explore collaborations, join our learning initiatives, or share your ideas. We're always open to curious minds and creative thinkers." },
  ],
};

export const demo = {
  title: 'Book Your Free Demo',
  lead: 'Ready to Transform Your Enterprise Intelligence?',
  first: 'First name*',
  last: 'Last name*',
  email: 'Email*',
  phone: 'Phone Number',
  message: 'Message',
  consent: 'I agree to the Privacy Policy and to Beyondlogik contacting me about this request.',
  note: "We use these details only to respond to your request. We don't use cookies or tracking.",
  submit: 'Submit',
  countries: [
    ['🇮🇳', 'IN', '+91'], ['🇺🇸', 'US', '+1'], ['🇬🇧', 'GB', '+44'], ['🇩🇪', 'DE', '+49'],
    ['🇫🇷', 'FR', '+33'], ['🇦🇺', 'AU', '+61'], ['🇸🇬', 'SG', '+65'], ['🇦🇪', 'AE', '+971'],
  ],
  sent: 'Thank you — we will get back to you shortly.',
};

export const cookie = {
  text: "We don't use cookies or tracking on this site.",
  link: 'Cookie Policy',
  ok: 'Got it',
};

/** Top header (site-wide pages). The in-page links in `nav` above live in the floating bottom bar on the home page. */
export const siteNav = [
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Insights', href: '/insights' },
  { label: 'Sirpi', href: '/studio' }, // Sirpi (சிற்பி) is the studio; the URL stays /studio
];
export const headerContact = { label: 'Contact', href: '/#book-a-demo' };

/** Placeholder pages: structure only – the real copy is to be supplied. */
export const placeholders: Record<string, { title: string; lead: string }> = {
  products: { title: 'Products', lead: 'Beyondlogik EIS and everything built around it.' },
  studio: { title: 'Studio', lead: 'A look inside how we design and build.' },
};

/**
 * About page (/about). Structure follows outcrowd.io/about-us: hero with an assembling grid → story intro → numbers → mission → values →
 * "a place for curious minds" collage → pinned horizontal timeline → what we build → CTA. Decisions from the client: no team photos
 * (product visuals instead), only known numbers, partner institutions are not named, Craveo (2025) is the first product.
 * The four values are a DRAFT written from the site's own copy (vision + learning pillars) – confirm or replace them.
 */
export const aboutPage = {
  hero: {
    kicker: 'About Beyondlogik',
    lines: ['Driven by curiosity,', 'built for real impact'],
    sub: 'Products, platforms and hands-on learning: the heart of our work since 2024.',
    // decorative grid that assembles on scroll (our own product visuals; no team photos)
    tiles: [
      '/video/focus-feeding-poster.webp', '/video/focus-work-poster.webp', '/video/focus-hiring-poster.webp', '/video/focus-moving-poster.webp',
      '/video/focus-including-poster.webp', '/video/focus-automating-poster.webp', '/video/hero-graph-poster.webp', '/video/hero-installs-poster.webp',
    ],
  },
  intro: {
    title: 'From building for others to building our own',
    cols: [
      [
        'Beyondlogik started in mid-2024 as a service company. We designed and built software for clients across several countries, and learned how real businesses run, what they need and what makes a product worth using every day.',
        'Every project taught us the same lesson: good technology starts with a real problem and the people who live with it, not with the technology itself.',
      ],
      [
        'In 2025 we turned that experience into products of our own, starting with Craveo, a seamless pre-ordering app for college canteens. More products followed, one real problem at a time.',
        'In 2026 we began building the Beyondlogik EIS platform for colleges and partnered with institutions on on-campus internships. Our next product is already taking shape, planned for 2027.',
      ],
    ],
  },
  stats: [
    { value: '2024', tag: 'founded', text: 'Started in mid-2024 as a service company, building software for clients across several nations.' },
    { value: '10+', tag: 'products', text: 'From Craveo, our first product, to platforms for business, hiring, transport and inclusion, all built by one team.' },
    { value: '2027', tag: 'next launch', text: 'Our next product is in the ideation stage today and is planned to launch in 2027.' },
  ],
  mission: {
    label: 'Our mission',
    text: 'We create technology that makes a meaningful difference, turning ambitious ideas into practical innovations that people use every day.',
  },
  values: {
    label: 'Our values',
    items: [
      { name: 'Curious & bold', text: 'We ask why, question the obvious and try what has not been tried yet.' },
      { name: 'Learn by doing', text: 'Practical knowledge over theory: we build, test, learn and improve.' },
      { name: 'Real problems first', text: 'Every product starts with real people and the problem they live with.' },
      { name: 'Better together', text: 'With clients, institutions and students, our best work is built in collaboration.' },
    ],
  },
  studio: {
    before: 'Our studio is a place for',
    highlight: ['curious', 'minds.'],
    text: 'A small team that designs, builds and ships its own products, and works with students on real product work through on-campus internships.',
    tiles: [
      '/video/hero-rocket-poster.webp', '/img/insight-coding.webp', '/video/hero-heart-poster.webp',
      '/img/insight-classroom.webp', '/video/hero-boost-poster.webp', '/img/insight-mcp.webp',
    ],
  },
  story: {
    label: 'The story of Beyondlogik',
    chapters: [
      { year: '2024', title: 'Where it began', text: 'We started in mid-2024 as a service company, designing and building software for clients across several nations.', img: '/img/about-y2024.webp', alt: 'Web, mobile and dashboard projects delivered for clients in several countries', side: '/video/hero-graph-poster.webp' },
      { year: '2025', title: 'Our first product', text: 'We began our product journey with Craveo, a seamless pre-ordering app for college canteens: order ahead, skip the queue, collect when it is ready. Other products followed, one real problem at a time.', img: '/video/focus-feeding-poster.webp', alt: 'Craveo, a pre-ordering app for college canteens', side: '/video/focus-including-poster.webp' },
      { year: '2026', title: 'A platform for colleges', text: 'We started building the Beyondlogik EIS platform for colleges and collaborated with institutions on on-campus internships, bringing students into real product work.', img: '/img/about-y2026.webp', alt: 'The Beyondlogik EIS platform: AI assistant, attendance, bus tracking and cafeteria', side: '/video/focus-moving-poster.webp' },
      { year: '2027', title: 'What comes next', text: "Our next product is in the ideation stage right now. We're shaping it today, and it is planned to launch in 2027.", img: '/img/about-y2027.webp', alt: 'A whiteboard of ideas for the next product, launching in 2027', side: '' },
    ],
  },
  work: {
    title: 'Trusted by clients across nations and institutions on campus',
    lead: 'We listen first, build in small steps and improve with every release. Here is what we have built so far.',
    eis: { cat: 'Education', type: 'Campus platform', year: '2026', name: 'Beyondlogik EIS', text: 'One app for colleges: an AI assistant for questions, AI attendance, live bus tracking and cafeteria pre-ordering.' },
  },
  cta: {
    title: 'Build with us',
    text: 'Have an idea, a campus collaboration or a problem worth solving? We would love to hear about it.',
    primary: 'Book a call',
    primaryHref: '/#book-a-demo',
    secondary: 'Write to us',
    visual: '/video/hero-graph-poster.webp',
  },
};
