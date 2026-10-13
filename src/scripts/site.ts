/**
 * The site's only script. Everything here is an enhancement: every page is
 * complete and readable without it.
 *   - scroll reveals: [data-reveal] rises 24px and fades in once (60ms stagger)
 *   - slideshows: [data-slideshow] crossfades with pause/play (Slideshow.astro)
 *   - header compacts after 40px of scroll
 *   - light parallax on [data-parallax] photos
 *   - phone menu sheet (modal dialog, focus trap, Esc, scroll lock)
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

/* ── phone menu sheet ───────────────────────────────────────────────── */

const sheet = document.querySelector<HTMLDialogElement>('[data-menu]');
const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');

function focusables(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((el) => el.offsetParent !== null);
}

function openMenu() {
  if (!sheet || sheet.open) return;
  sheet.showModal();
  root.classList.add('menu-open');
  root.style.overflow = 'hidden';
  openBtn?.setAttribute('aria-expanded', 'true');
  // Start on the first page link rather than the close button.
  sheet.querySelector<HTMLElement>('nav a')?.focus();
}

function closeMenu() {
  if (!sheet?.open) return;
  sheet.close();
}

sheet?.addEventListener('close', () => {
  root.classList.remove('menu-open');
  root.style.removeProperty('overflow');
  openBtn?.setAttribute('aria-expanded', 'false');
  openBtn?.focus();
});
openBtn?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
sheet?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMenu();
    return;
  }
  if (e.key !== 'Tab') return;
  const items = focusables(sheet);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
// A same-page link (or a resize up to desktop) closes the sheet.
sheet?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu()));
window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && closeMenu());

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
