/**
 * The site's only script. Everything here is an enhancement: every page is
 * complete and readable without it.
 *   - scroll reveals: [data-reveal] rises 24px and fades in once (60ms stagger)
 *   - slideshows: [data-slideshow] crossfades with pause/play (Slideshow.astro)
 *   - header compacts after 40px of scroll
 *   - light parallax on [data-parallax] photos
 *   - the phone menu: a panel under the header (Esc, tap outside, scroll lock)
 *   - the header dropdowns: About Us, Events, Contact ([data-dropdown])
 *   - same-page anchors in the header and menu scroll smoothly below the header
 *   - hides events that have ended ([data-ends]) and keeps "Next meeting" current
 *   - copy-to-clipboard buttons ([data-copy])
 * Under prefers-reduced-motion: reduce, nothing moves and nothing is hidden.
 */

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionOK = () => !reduced.matches;
root.classList.add('motion-ready');

/* ── scroll reveals ─────────────────────────────────────────────────── */

const STAGGER = 60;

function settle(el: HTMLElement, delay: number) {
  window.setTimeout(() => {
    el.classList.add('is-done');
    el.style.removeProperty('--d');
  }, 600 + delay);
}

function reveal(el: HTMLElement, delay = 0) {
  el.style.setProperty('--d', `${delay}ms`);
  el.classList.add('is-in');
  settle(el, delay);
}

const revealables = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

if (!motionOK() || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in', 'is-done'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      // Stagger only elements that enter together, in document order.
      entering.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      entering.forEach((el, i) => {
        io.unobserve(el);
        reveal(el, Math.min(i, 8) * STAGGER);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  revealables.forEach((el) => io.observe(el));
}

/* ── header compaction + parallax (one rAF-throttled scroll handler) ── */

const header = document.querySelector<HTMLElement>('[data-header]');
const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('is-compact', y > 40);
  if (motionOK()) {
    const vh = window.innerHeight;
    for (const el of parallax) {
      const box = el.parentElement!.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) continue;
      // -1 when the frame's center is a viewport below center, +1 a viewport above.
      const progress = (vh / 2 - (box.top + box.height / 2)) / vh;
      const range = Number(el.dataset.parallax) || 36;
      el.style.transform = `translate3d(0, ${(progress * range).toFixed(1)}px, 0) scale(1.1)`;
    }
  }
  ticking = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
window.addEventListener('resize', () => requestAnimationFrame(onScroll), { passive: true });
onScroll();
reduced.addEventListener('change', () => {
  if (!motionOK()) parallax.forEach((el) => el.style.removeProperty('transform'));
  revealables.forEach((el) => el.classList.add('is-in', 'is-done'));
});

/* ── phone menu (a panel under the header) ──────────────────────────── */
/* The menu button toggles the panel; the page stays in view, dimmed and
   still. Esc closes it and returns focus to the button; a tap outside, a
   link, tabbing out or a resize up to desktop also close it. */

const menu = document.querySelector<HTMLElement>('[data-menu]');
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const scrim = document.querySelector<HTMLElement>('[data-menu-scrim]');
const menuIsOpen = () => root.classList.contains('menu-open');

function openMenu() {
  if (!menu || menuIsOpen()) return;
  root.classList.add('menu-open');
  root.style.overflow = 'hidden';
  menuBtn?.setAttribute('aria-expanded', 'true');
}

function closeMenu(returnFocus = false) {
  if (!menuIsOpen()) return;
  root.classList.remove('menu-open');
  root.style.removeProperty('overflow');
  menuBtn?.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuBtn?.focus();
}

menuBtn?.addEventListener('click', () => (menuIsOpen() ? closeMenu() : openMenu()));
scrim?.addEventListener('click', () => closeMenu());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuIsOpen()) {
    e.preventDefault();
    closeMenu(true);
  }
});
menu?.addEventListener('focusout', (e) => {
  const next = e.relatedTarget as Node | null;
  if (next && next !== menuBtn && !menu.contains(next)) closeMenu();
});
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu()));
window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && closeMenu());
// Going back to a cached page: start closed.
window.addEventListener('pageshow', () => closeMenu());

/* ── events that have ended disappear, "Next meeting" stays current ── */

const now = Date.now();
document.querySelectorAll<HTMLElement>('[data-ends]').forEach((el) => {
  if (Date.parse(el.dataset.ends!) < now) el.hidden = true;
});
document.querySelectorAll<HTMLElement>('[data-event-list]').forEach((list) => {
  const left = list.querySelectorAll('[data-ends]:not([hidden])').length;
  const empty = list.parentElement?.querySelector<HTMLElement>('[data-event-empty]');
  if (!left) {
    list.hidden = true;
    if (empty) empty.hidden = false;
  }
});

type NextEvent = { title: string; date: string; time: string; place: string; link?: string; endsAt: string };

document.querySelectorAll<HTMLElement>('[data-next-meeting]').forEach((strip) => {
  let list: NextEvent[] = [];
  try {
    list = JSON.parse(strip.dataset.nextMeeting || '[]');
  } catch {
    return;
  }
  const current = list.find((e) => Date.parse(e.endsAt) >= now);
  const set = (key: string, value: string) => {
    const el = strip.querySelector<HTMLElement>(`[data-field="${key}"]`);
    if (el) el.textContent = value;
  };
  if (!current) {
    strip.querySelector<HTMLElement>('[data-next-filled]')?.setAttribute('hidden', '');
    strip.querySelector<HTMLElement>('[data-next-empty]')?.removeAttribute('hidden');
    return;
  }
  if (current === list[0]) return;
  set('title', current.title);
  set('date', current.date);
  set('time', current.time);
  set('place', current.place);
  const a = strip.querySelector<HTMLAnchorElement>('[data-field="link"]');
  if (a && current.link) a.href = current.link;
});

/* ── copy to clipboard ──────────────────────────────────────────────── */

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  if (!navigator.clipboard) return;
  btn.hidden = false;
  const label = btn.querySelector<HTMLElement>('[data-copy-label]');
  const original = label?.textContent ?? '';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy!);
      if (label) label.textContent = btn.dataset.copied || original;
      window.setTimeout(() => label && (label.textContent = original), 2000);
    } catch {
      /* clipboard blocked: the mailto link next to the button still works */
    }
  });
});

/* ── slideshows ([data-slideshow], see Slideshow.astro) ─────────────── */

const pad2 = (n: number) => String(n).padStart(2, '0');

function initSlideshow(root: HTMLElement) {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const toggle = root.querySelector<HTMLButtonElement>('[data-show-toggle]');
  const counter = root.querySelector<HTMLElement>('[data-show-current]');
  const frame = root.querySelector<HTMLElement>('[data-show-frame]');
  if (slides.length < 2 || !toggle) return;
  const interval = Number(root.dataset.interval) || 5000;
  let index = 0;
  let seq = 0;
  let userPaused = !motionOK(); // reduced motion: never auto-advance on its own
  let hovering = false;
  let focused = false;
  let onscreen = false;
  let timer = 0;

  const load = (i: number) => slides[i].classList.add('is-loaded');
  const render = () => {
    root.toggleAttribute('data-paused', userPaused);
    toggle.setAttribute('aria-label', (userPaused ? toggle.dataset.labelPlay : toggle.dataset.labelPause) || '');
    // Announce slide changes only while the user is in control.
    frame?.setAttribute('aria-live', userPaused ? 'polite' : 'off');
  };

  function go(target: number) {
    const i = (target + slides.length) % slides.length;
    if (i === index) return;
    const mine = ++seq;
    load(i);
    const img = slides[i].querySelector('img');
    const ready = img && !img.complete ? Promise.race([img.decode().catch(() => undefined), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    ready.then(() =>
      requestAnimationFrame(() => {
        if (mine !== seq) return;
        slides.forEach((s, j) => {
          s.classList.toggle('is-active', j === i);
          if (j === i) s.removeAttribute('aria-hidden');
          else s.setAttribute('aria-hidden', 'true');
        });
        index = i;
        if (counter) counter.textContent = pad2(i + 1);
        load((i + 1) % slides.length); // fetch the next photo before it is needed
      }),
    );
  }

  const playing = () => !userPaused && !hovering && !focused && onscreen && !document.hidden;
  function schedule() {
    window.clearTimeout(timer);
    if (playing()) timer = window.setTimeout(() => (go(index + 1), schedule()), interval);
  }

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    render();
    schedule();
  });
  root.querySelector('[data-show-prev]')?.addEventListener('click', () => (go(index - 1), schedule()));
  root.querySelector('[data-show-next]')?.addEventListener('click', () => (go(index + 1), schedule()));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + (e.key === 'ArrowRight' ? 1 : -1));
      schedule();
    }
  });
  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') (hovering = true), schedule();
  });
  root.addEventListener('pointerleave', () => ((hovering = false), schedule()));
  root.addEventListener('focusin', () => ((focused = true), schedule()));
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node)) (focused = false), schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => {
    if (reduced.matches) (userPaused = true), render(), schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        onscreen = entry.isIntersecting;
        if (onscreen) load(1); // the second photo loads once the slideshow is in view
        schedule();
      },
      { threshold: 0.25 },
    ).observe(root);
  } else {
    onscreen = true;
    load(1);
  }
  render();
  schedule();
}

document.querySelectorAll<HTMLElement>('[data-slideshow]').forEach(initSlideshow);

/* ── header dropdowns ([data-dropdown], the About Us menu) ──────────── */
/* Opens on hover (mouse only, 100 ms in, 250 ms out), on click or tap, and
   by keyboard. Enter, Space or ArrowDown open it and focus the first item;
   arrows move between items; Esc closes and returns focus to the trigger;
   Tab out or a click outside closes it. */

/** Every dropdown's close function: opening one closes the others. */
const dropdownClosers = new Set<() => void>();

function initDropdown(root: HTMLElement) {
  const trigger = root.querySelector<HTMLButtonElement>('[data-dropdown-trigger]');
  const items = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-dropdown-item]'));
  if (!trigger || !items.length) return;
  let open = false;
  let pinned = false; // opened by click, tap or keyboard: stays open when the pointer leaves
  let openTimer = 0;
  let closeTimer = 0;
  let skipClick = false;

  const setOpen = (next: boolean) => {
    if (next) dropdownClosers.forEach((close) => close !== closeThis && close());
    open = next;
    if (!next) pinned = false;
    root.classList.toggle('is-open', next);
    trigger.setAttribute('aria-expanded', String(next));
  };
  const clearTimers = () => {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
  };
  const closeThis = () => {
    clearTimers();
    if (open) setOpen(false);
  };
  dropdownClosers.add(closeThis);
  const focusItem = (i: number) => items[(i + items.length) % items.length].focus();

  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimers();
    if (!open) openTimer = window.setTimeout(() => setOpen(true), 100);
  });
  root.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimers();
    if (open && !pinned) closeTimer = window.setTimeout(() => setOpen(false), 250);
  });

  trigger.addEventListener('click', () => {
    if (skipClick) {
      skipClick = false;
      return;
    }
    clearTimers();
    if (open && !pinned) pinned = true; // hover opened it; a click keeps it open
    else if (open) setOpen(false);
    else {
      setOpen(true);
      pinned = true;
    }
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      skipClick = e.key === ' ' || e.key === 'Enter';
      clearTimers();
      setOpen(true);
      pinned = true;
      focusItem(e.key === 'ArrowUp' ? -1 : 0);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  });
  trigger.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') window.setTimeout(() => (skipClick = false), 0);
  });

  root.addEventListener('keydown', (e) => {
    if (e.target === trigger) return; // the trigger's own keys are handled above
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') (e.preventDefault(), focusItem(i + 1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), focusItem(i - 1));
    else if (e.key === 'Home') (e.preventDefault(), focusItem(0));
    else if (e.key === 'End') (e.preventDefault(), focusItem(-1));
    else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      trigger.focus();
    }
  });

  // Tab out of the menu, or click anywhere else: close.
  root.addEventListener('focusout', (e) => {
    if (open && !root.contains(e.relatedTarget as Node)) setOpen(false);
  });
  document.addEventListener('pointerdown', (e) => {
    if (open && !root.contains(e.target as Node)) setOpen(false);
  });
  // Going back to a cached page: start closed.
  window.addEventListener('pageshow', () => setOpen(false));
}

document.querySelectorAll<HTMLElement>('[data-dropdown]').forEach(initDropdown);

/* ── same-page anchors in the header and the phone menu ─────────────── */
/* A link to a section of the page you are on closes the open menu and
   scrolls there smoothly (instantly under reduced motion). The target lands
   below the fixed header (scroll-padding-top + scroll-margin-top in CSS),
   and focus moves to it so keyboard users continue from there. */

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href*="#"]');
  if (!link || !link.closest('[data-header], [data-menu]')) return;
  const url = new URL(link.href, location.href);
  if (url.pathname !== location.pathname || url.hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  e.preventDefault();
  dropdownClosers.forEach((close) => close());
  closeMenu();
  if (location.hash !== url.hash) history.pushState(null, '', url.hash);
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});
