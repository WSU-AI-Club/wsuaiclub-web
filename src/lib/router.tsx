import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

export type Route = '/' | '/join';

/** Unknown paths render the home page. */
export function routeFor(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean === '/join' ? '/join' : '/';
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFor(window.location.pathname));
  useEffect(() => {
    const onPop = () => setRoute(routeFor(window.location.pathname));
    window.addEventListener('popstate', onPop);
    window.addEventListener('app:navigate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('app:navigate', onPop);
    };
  }, []);
  return route;
}

const internal = (href: string) => /^\/(?!chocolathon)(?!\/)/.test(href);

/** Same-tab navigation for / and /join. Everything else is a normal link. */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!internal(href)) return;
    const [path, hash] = href.split('#');
    event.preventDefault();
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('app:navigate'));
    }
    requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    });
  };
  return <a href={href} onClick={handle} {...rest} />;
}
