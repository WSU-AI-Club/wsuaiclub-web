/**
 * The site's only script. Everything here is an enhancement: every page is
 * complete and readable without it.
 *   - scroll reveals: [data-reveal] rises 24px and fades in once (60ms stagger)
 *   - count-up: [data-count] numbers count up once when they come into view
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
  if (el.matches('[data-count]')) countUp(el, delay);
  el.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => countUp(c, delay));
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

/* ── count-up ───────────────────────────────────────────────────────── */

const counted = new WeakSet<HTMLElement>();

function countUp(el: HTMLElement, delay: number) {
  if (counted.has(el)) return;
  counted.add(el);
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || !motionOK()) return;
  const duration = 1200;
  el.textContent = '0';
  window.setTimeout(() => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, delay + 120);
}

// Numbers outside any [data-reveal] still count when they scroll in.
if (motionOK() && 'IntersectionObserver' in window) {
  const lone = Array.from(document.querySelectorAll<HTMLElement>('[data-count]')).filter((el) => !el.closest('[data-reveal]'));
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        cio.unobserve(e.target);
        countUp(e.target as HTMLElement, 0);
      }
    });
  });
  lone.forEach((el) => cio.observe(el));
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
