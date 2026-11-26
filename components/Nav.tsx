import { nav, dock, contact, social } from '@/lib/content';

function Social({ className = '' }: { className?: string }) {
  const items = [
    { href: social.instagram, src: '/svg/social-instagram.svg', set: 'set-2', label: 'Instagram' },
    { href: social.x, src: '/svg/social-x.svg', set: 'set-1', label: 'X' },
    { href: social.linkedin, src: '/svg/social-linkedin.svg', set: 'set-3', label: 'LinkedIn' },
  ];
  return (
    <div className={className || 'social-link-list'}>
      {items.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="social-footer-wrap w-inline-block">
          <div className="social-footer">
            <img src={s.src} loading="lazy" alt="" className={`icon-footer ${s.set}`} />
            <div className="explode _400" />
          </div>
        </a>
      ))}
    </div>
  );
}

/**
 * The page's in-page navigation, docked as a floating bar at the bottom-centre of the viewport
 * (same pill, flip-hover links and orange button as the original header; see `.bl-dock` in site.css).
 * Over the hero it is expanded (logo, links, "Book a call", "Contact"); past the hero the links fold away and only the logo and the two buttons stay.
 * Behaviour (theme by section, active link) lives in `navBehaviour()` in lib/effects.ts.
 */
export default function Nav() {
  return (
    <div data-w-id="0a812902-6ae6-6151-13ca-f85ba6a258ca" style={{ opacity: 0 }} className="nav-wrap bl-dock">
      <header data-w-id="8b251f90-ecf6-2712-000f-63a6e0b37b66" className="header-new">
        <div className="header-wrapper">
          <nav className="nav-new" aria-label="On this page">
            <a href="#top" className="bl-tile" aria-label="Back to the top">
              <img src="/img/logo-mark-168.webp" width={168} height={175} alt="" className="bl-tile-logo" />
            </a>
            <div className="nav-link-wrap nav-menu">
              <div className="bl-links-in">
                {nav.map((l) => (
                  <a key={l.href} href={l.href} className={`footer-link w-inline-block bl-dock-link${l.href === '#approach' ? ' bl-hide-sm' : ''}`}>
                    <div className="footer-flip-hover">
                      <div className="footer-nav-link nav">{l.label}</div>
                      <div className="footer-nav-link hover">{l.label}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="header-btn-wrap">
              <a href="#book-a-demo" className="nav_link-c contact w-inline-block">
                <div className="btn-text opacity-90">{dock.book}</div>
                <div className="explode violet" />
              </a>
              <a href="#contact" className="nav_link-c contact grey bl-dock-contact w-inline-block">
                <div className="btn-text opacity-90">{dock.contact}</div>
                <div className="explode violet" />
              </a>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}

export { Social, contact };
