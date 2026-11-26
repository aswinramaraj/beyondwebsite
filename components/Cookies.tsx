import { cookie } from '@/lib/content';

/** Notice banner (same component styling as the original consent banner; no cookies are used, so one button). */
export default function Cookies() {
  return (
    <div className="cookies">
      <div fs-cc="banner" className="fs-cc-banner_component">
        <div className="fs-cc-banner-content">
          <div className="fs-cc-banner_container">
            <div className="fs-cc-banner_text">
              {cookie.text}{' '}
              <a href="#" className="bl-cookie-link">{cookie.link}</a>
            </div>
            <div className="fs-cc-banner_buttons-wrapper">
              <a fs-cc="allow" href="#" className="fs-cc-banner_button w-button">{cookie.ok}</a>
            </div>
          </div>
        </div>
        <div fs-cc="interaction" className="fs-cc-banner_trigger" />
      </div>
    </div>
  );
}
