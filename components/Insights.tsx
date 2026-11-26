import { insights } from '@/lib/content';
import { getPosts, postHref } from '@/lib/insights';

function Arrow({ src }: { src: string }) {
  return (
    <div className="btn-icon-wrap">
      <img src={src} loading="lazy" alt="" className="icon-btn-secondary first-icon" />
      <img src={src} loading="lazy" alt="" className="icon-btn-secondary second-icon" />
    </div>
  );
}

/**
 * "Insights" on the home page: the three newest posts from content/insights (a large featured one and two more), same layout and
 * animations as the original's blog section. Each card opens its article; the button opens the full feed at /insights.
 */
export default function Insights() {
  const [feat, ...rest] = getPosts().slice(0, 3).map((p) => ({ href: postHref(p.slug), label: p.topic, title: p.title, img: p.cover }));
  return (
    <div className="bg-style">
      <section id="insights" section-color="white" data-w-id="e8b85403-f394-d269-3ea7-1668de36b09d" className="section is-blog">
        <div className="container is-big">
          <div className="header-block">
            <div className="section-heading">
              <h2 className="heading-2 text-align-center max-w-55 text-color-white">{insights.title}</h2>
              <div className="shadow vertical hide" />
            </div>
            <div className="collection-news-wrap">
              <div className="collection-list-wrapper-2 w-dyn-list">
                <div role="list" className="w-dyn-items">
                  <div role="listitem" className="w-dyn-item">
                    <a href={feat.href} className="blog-feature-link w-inline-block">
                      <div className="featured-img-wrap">
                        <img src={feat.img} loading="lazy" alt="" className="feature-img" />
                        <img src="/img/leaf-yellow.png" loading="lazy" alt="" className="vect-comp set-1" />
                        <img src="/img/leaf-white.png" loading="lazy" alt="" className="vect-comp set-2" />
                        <img src="/img/leaf-orange.png" loading="lazy" alt="" className="vect-comp2 set-3" />
                        <img src="/img/leaf-blue.png" loading="lazy" alt="" className="vect-comp2 set-4" />
                      </div>
                      <div className="news-info">
                        <div className="haeding-blog">{feat.title}</div>
                        <div className="bl-update-label">{feat.label}</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="collection-list-wrapper w-dyn-list">
                <div role="list" className="blog-home w-dyn-items">
                  {rest.map((u) => (
                    <div role="listitem" className="w-dyn-item" key={u.href}>
                      <a href={u.href} className="blog-feature-link w-inline-block">
                        <img src={u.img} loading="lazy" alt="" className="blog-news-home-img" />
                        <div className="news-info max-w-22-7">
                          <div className="haeding-blog">{u.title}</div>
                          <div className="bl-update-label">{u.label}</div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <a href={insights.href} className="btn-secondary news w-inline-block">
            <div className="btn-text-wrap">
              <div className="btn-text-secondary first-txt">{insights.more}</div>
              <div className="btn-text-secondary second-txt">{insights.more}</div>
            </div>
            <Arrow src="/svg/arrow-btn.svg" />
          </a>
        </div>
      </section>
    </div>
  );
}
