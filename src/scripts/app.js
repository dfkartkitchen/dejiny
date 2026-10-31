// Společné chování webu: plynulý scroll, scroll animace, postup studia, motiv, klávesy.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const projektor = () => root.hasAttribute('data-projektor');
export const calm = reduce || projektor();

/* ---------- úložiště (bezpečně) ---------- */
export const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* soukromý režim */ } },
};
export const STAV_KEY = 'dvk-stav';

/* ---------- plynulý scroll ---------- */
let lenis = null;
if (!calm) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- ukazatel postupu scrollu ---------- */
const bar = document.querySelector('.scroll-progress span');
if (bar) {
  const upd = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener('scroll', upd, { passive: true });
  upd();
}

/* ---------- odkrývání při scrollu ---------- */
const reveals = document.querySelectorAll('[data-reveal]');
if (calm || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  reveals.forEach((el) => io.observe(el));
}

/* ---------- úvod: galerijní stěna ---------- */
const tiles = gsap.utils.toArray('[data-tile]');
if (tiles.length && !calm) {
  gsap.from(tiles, {
    opacity: 0,
    y: () => gsap.utils.random(-120, 120),
    x: () => gsap.utils.random(-80, 80),
    rotate: () => gsap.utils.random(-8, 8),
    scale: 0.85,
    duration: 1.8,
    ease: 'expo.out',
    stagger: { each: 0.035, from: 'random' },
  });
  // nadpis je vidět hned (rychlé vykreslení), jen jemně dojede; ostatní prvky se plynule objeví
  gsap.from('#hero-title', { y: 24, duration: 1.4, ease: 'power3.out' });
  gsap.from('[data-hero-in]:not(#hero-title)', { opacity: 0, y: 30, duration: 1.2, ease: 'power3.out', stagger: 0.1, delay: 0.25 });
  gsap.to('[data-wall]', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ---------- časová osa ---------- */
const osa = document.querySelector('[data-osa]');
if (osa) {
  const saveData = navigator.connection?.saveData;
  const vids = calm || saveData ? [] : [...osa.querySelectorAll('[data-osa-video]')];
  const setEpocha = (id) => {
    root.dataset.epocha = id;
    vids.forEach((v) => {
      const on = v.dataset.osaVideo === id && osa.classList.contains('is-horizontal');
      v.classList.toggle('is-on', on);
      if (on) v.play().catch(() => {}); else v.pause();
    });
    document.querySelectorAll('[data-legend]').forEach((l) => l.classList.toggle('is-active', l.dataset.legend === id));
  };
  const sections = gsap.utils.toArray('[data-epocha-section]');
  const mm = gsap.matchMedia();

  mm.add({ desktop: '(min-width: 960px)', mobile: '(max-width: 959px)' }, (ctx) => {
    if (ctx.conditions.desktop && !calm) {
      osa.classList.add('is-horizontal');
      const track = osa.querySelector('[data-osa-track]');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '[data-osa-pin]', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      sections.forEach((s) => ScrollTrigger.create({
        trigger: s, containerAnimation: tween, start: 'left 55%', end: 'right 55%',
        onToggle: (self) => self.isActive && setEpocha(s.dataset.epochaSection),
      }));
      return () => osa.classList.remove('is-horizontal');
    }
    sections.forEach((s) => ScrollTrigger.create({
      trigger: s, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => self.isActive && setEpocha(s.dataset.epochaSection),
    }));
  });
  setEpocha(sections[0]?.dataset.epochaSection);
}

/* ---------- stránka otázky ---------- */
const article = document.querySelector('[data-otazka]');
if (article) {
  if (!calm) {
    gsap.to('[data-parallax]', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.q-hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.from('.q-hero-inner > *', { opacity: 0, y: 40, duration: 1.4, ease: 'power3.out', stagger: 0.1, delay: 0.15 });
  }
  document.querySelectorAll('[data-flip]').forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('.face-front').setAttribute('aria-hidden', String(on));
    b.querySelector('.face-back').setAttribute('aria-hidden', String(!on));
  }));
  document.querySelector('[data-scroll-top]')?.addEventListener('click', () => (lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })));

  // klávesy: ← → mezi otázkami
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft' && article.dataset.prev) location.href = article.dataset.prev;
    if (e.key === 'ArrowRight' && article.dataset.next) location.href = article.dataset.next;
  });
}

/* ---------- postup studia ---------- */
export function renderStav() {
  const stav = store.get(STAV_KEY, {});
  document.querySelectorAll('[data-stav-dot]').forEach((d) => { d.dataset.stav = stav[d.dataset.stavDot] || ''; });
  document.querySelectorAll('[data-stav-switch]').forEach((g) => {
    const s = stav[g.dataset.stavSwitch];
    g.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stav === s)));
  });
  const umim = Object.values(stav).filter((v) => v === 'umim').length;
  document.querySelectorAll('[data-hotovo]').forEach((h) => {
    h.querySelector('.hotovo-text').textContent = `${umim}/30`;
    h.querySelector('.hotovo-bar').style.setProperty('--p', `${(umim / 30) * 100}%`);
    h.title = `Mám hotovo ${umim} z 30 otázek`;
  });
}
document.querySelectorAll('[data-stav-switch]').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-stav]');
  if (!b) return;
  const stav = store.get(STAV_KEY, {});
  const id = g.dataset.stavSwitch;
  stav[id] = stav[id] === b.dataset.stav ? undefined : b.dataset.stav;
  store.set(STAV_KEY, stav);
  renderStav();
}));
addEventListener('storage', renderStav);
renderStav();

/* ---------- motiv a projektor ---------- */
document.querySelector('[data-toggle-projektor]')?.addEventListener('click', () => toggleProjektor());
function toggleProjektor() {
  const on = !projektor();
  try { localStorage.setItem('dvk-projektor', on ? '1' : '0'); } catch { /* */ }
  location.reload();
}
document.querySelector('[data-toggle-theme]')?.addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('dvk-motiv', root.dataset.theme); } catch { /* */ }
});
addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey) return;
  if (e.key === 'p' || e.key === 'P') toggleProjektor();
});

/* ---------- offline (service worker) ---------- */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}));
}
