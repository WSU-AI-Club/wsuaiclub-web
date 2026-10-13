import { useEffect } from 'react';
import { site } from './content/site';
import { useRoute } from './lib/router';
import { Footer, Header } from './components/Parts';
import Home from './pages/Home';
import Join from './pages/Join';

const ORIGIN = 'https://www.wsuaiclub.com';

function setMeta(selector: string, attr: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

export default function App() {
  const route = useRoute();
  useEffect(() => {
    const meta = route === '/join' ? site.meta.join : site.meta.home;
    const url = route === '/join' ? `${ORIGIN}/join` : `${ORIGIN}/`;
    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
  }, [route]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{route === '/join' ? <Join /> : <Home />}</main>
      <Footer />
    </>
  );
}
