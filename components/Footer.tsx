import { brand, nav, legal, contact, social, cta } from '@/lib/content';

function FLink({ href, children, main, external }: { href: string; children: React.ReactNode; main?: boolean; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`footer-link ${main ? 'main ' : ''}w-inline-block`}>
      <div className="footer-flip-hover">
        <div className={`footer-nav-link${main ? ' white' : ''}`}>{children}</div>
        <div className="footer-nav-link hover">{children}</div>
      </div>
    </a>
  );
}

export default function Footer({ base = '' }: { base?: string }) {
  const h = (x: string) => (x.startsWith('#') ? base + x : x); // in-page links get a '/' base on other pages
  const icons = [
    { href: social.instagram, src: '/svg/social-instagram.svg', set: 'set-2', label: 'Instagram' },
    { href: social.x, src: '/svg/social-x.svg', set: 'set-1', label: 'X' },
    { href: social.linkedin, src: '/svg/social-linkedin.svg', set: 'set-3', label: 'LinkedIn' },
  ];
  return (
    <footer section-color="white" className="footer">
      <div className="container is-footer">
        <div className="footer-main">
          <div className="nav-block">
            <div className="footer-col">
              <div className="footer-secondary-link-list">
                <FLink href={h('#top')} main>Navigate</FLink>
                {nav.map((l) => <FLink key={l.href} href={h(l.href)}>{l.label}</FLink>)}
                <FLink href={h(cta.href)}>{cta.primary}</FLink>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-secondary-link-list">
                <FLink href="#" main>Legal</FLink>
                {legal.map((l) => <FLink key={l.label} href={l.href} external>{l.label}</FLink>)}
              </div>
            </div>
            <div id="contact" className="footer-col">
              <div className="footer-secondary-link-list">
                <FLink href={h('#book-a-demo')} main>Contact</FLink>
                <FLink href={contact.phoneHref}>{contact.phone}</FLink>
              </div>
            </div>
          </div>
          <div className="links-block">
            <a href={`mailto:${contact.email}`} className="email-link">{contact.email}</a>
            <div className="social-link-list is-footer">
              {icons.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="social-footer-wrap w-inline-block">
                  <div className="social-footer">
                    <img src={s.src} loading="lazy" alt="" className={`icon-footer ${s.set}`} />
                    <div className="explode _400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bot">
          <div className="copy max-w-14">{`© ${brand.year} ${brand.name}. All rights reserved.`}</div>
          <div className="copy">{contact.address[1]}</div>
        </div>
      </div>
    </footer>
  );
}
