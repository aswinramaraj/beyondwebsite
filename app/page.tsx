import Preloader from '@/components/Preloader';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import StagesHeading from '@/components/StagesHeading';
import Stages from '@/components/Stages';
import Services from '@/components/Services';
import Clients from '@/components/Clients';
import Insights from '@/components/Insights';
import Faq from '@/components/Faq';
import Cta from '@/components/Cta';
import Footer from '@/components/Footer';
import Cookies from '@/components/Cookies';
import Runtime from '@/components/Runtime';

export default function Page() {
  return (
    <>
      <Preloader />
      <div className="page-wrapper dark">
        <img
          data-w-id="c7ebdd10-96e6-6f07-0a53-6faa50d08234"
          className="light"
          src="/img/light.webp"
          srcSet="/img/light-p-500.webp 500w, /img/light-p-800.webp 800w, /img/light-p-1080.webp 1080w, /img/light-p-1600.webp 1600w, /img/light-p-2000.webp 2000w, /img/light-p-2600.webp 2600w, /img/light.webp 2804w"
          sizes="(max-width: 2804px) 100vw, 2804px"
          alt=""
          style={{ opacity: 0 }}
        />
        <Nav />
        <main className="main">
          <Hero />
          <Stats />
          <StagesHeading />
          <Stages />
          <Services />
          <Clients />
          <Insights />
          <Faq />
          <Cta />
        </main>
        <Footer />
        <Cookies />
      </div>
      <Runtime />
    </>
  );
}
