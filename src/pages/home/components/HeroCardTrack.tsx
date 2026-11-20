import { FastAverageColor } from 'fast-average-color';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_MOOD, vividColor } from '../color';
import { MOOD_OVERRIDES, PROJECTS, WORK, projectPath } from '../content';
import { rememberHomeScroll } from '../nav-state';
import { openProjectFromCard } from '../open-project';

gsap.registerPlugin(ScrollTrigger);
// Phones: the address bar sliding away changes the window height; do not rebuild the carousel for that.
ScrollTrigger.config({ ignoreMobileResize: true });

const CARDS = PROJECTS;
/**
 * Phones and tablets get a lighter version of the carousel: the cards only slide and scale (no 3D, no per-frame
 * glow, shadow or gradient changes), and the focused card is marked with an attribute that CSS fades in. This keeps
 * the picture and text layers still instead of repainting them every frame, which is what made them flash.
 */
const isLite = (): boolean => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
/** Scroll spent clearing the hero (logo zooms, text fades) before the first card shows. */
const clearHero = (): number => window.innerHeight * 0.45;
/** Cards travel this many px per px of scroll, so they feel quick and responsive. */
const CARD_SPEED = 1.7;
/** On phones the cards travel much less per px of scroll: a thumb flick covers a lot of ground, so 1.7 felt far too fast. */
const CARD_SPEED_LITE = 0.75;

/** Light streaks that rush across the screen; they brighten with scroll speed. */
const SPEED_LINES = [
  { top: 8, w: 26, d: 1.1, red: false },
  { top: 15, w: 18, d: 0.8, red: true },
  { top: 23, w: 34, d: 1.4, red: false },
  { top: 31, w: 22, d: 0.9, red: true },
  { top: 38, w: 30, d: 1.2, red: false },
  { top: 46, w: 16, d: 0.7, red: false },
  { top: 54, w: 28, d: 1.0, red: true },
  { top: 61, w: 20, d: 1.3, red: false },
  { top: 69, w: 36, d: 0.9, red: false },
  { top: 77, w: 24, d: 1.1, red: true },
  { top: 84, w: 32, d: 0.8, red: false },
  { top: 92, w: 18, d: 1.5, red: false },
] as const;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number): number => clamp(v, 0, 1);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Flat, straight cards that sweep in from the right over the hero. The card at the centre comes
 * forward, grows and glows in its own colour while the others settle back. Position follows scroll
 * through a damped follower, with a soft magnet that settles the nearest card to the centre.
 * Clicking a card grows its picture to fill the window and opens that project's page.
 */
export default function HeroCardTrack() {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const moodRef = useRef<HTMLDivElement>(null);
  // Card colours as numbers, for blending inside the per-frame loop.
  const rgbRef = useRef<number[][]>(CARDS.map((c) => (MOOD_OVERRIDES[c.slug] ?? DEFAULT_MOOD).split(',').map(Number)));
  const [colors, setColors] = useState<string[]>(() => CARDS.map((c) => MOOD_OVERRIDES[c.slug] ?? DEFAULT_MOOD));
  const [lite] = useState(isLite);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Read each picture's dominant colour once (used for the card's glow).
  useEffect(() => {
    let cancelled = false;
    const fac = new FastAverageColor();
    Promise.all(
      CARDS.map((card) =>
        fac
          .getColorAsync(card.image, {
            algorithm: 'dominant',
            ignoredColor: [
              [0, 0, 0, 255, 70],
              [255, 255, 255, 255, 40],
            ],
          })
          .then((result) => vividColor(result.value))
          .catch(() => DEFAULT_MOOD),
      ),
    )
      .then((list) => {
        if (!cancelled) {
          // A hand-picked colour wins over the one read from the picture.
          const final = list.map((c, i) => MOOD_OVERRIDES[CARDS[i].slug] ?? c);
          rgbRef.current = final.map((c) => c.split(',').map(Number));
          setColors(final);
        }
      })
      .finally(() => fac.destroy());
    return () => {
      cancelled = true;
    };
  }, []);

  const openCard = (index: number, button: HTMLElement): void => {
    const project = CARDS[index];
    rememberHomeScroll(); // so Back returns to this exact spot
    const go = (): void => navigate(projectPath(project.slug));
    if (reduced) {
      go();
      return;
    }
    openProjectFromCard({ rect: button.getBoundingClientRect(), image: project.image, color: colors[index], go });
  };

  // Scroll: clear the hero, then run the carousel.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || reduced) return undefined;

    const hero = document.getElementById('hero-first');
    const lines = wrap.querySelector<HTMLElement>('[data-speed-lines]');
    const mood = moodRef.current;
    const blend = [255, 0, 60];

    // Cached geometry: card centres inside the track. No layout reads happen per frame.
    let centres: number[] = [];
    const measure = (): void => {
      centres = CARDS.map((_, i) => {
        const el = wrapperRefs.current[i];
        return el ? el.offsetLeft + el.offsetWidth / 2 : 0;
      });
    };
    const range = (): { start: number; end: number } => {
      // Cards enter from the right edge and finish with the last card centred.
      const last = centres[centres.length - 1];
      const first = centres[0];
      const end = last ? window.innerWidth / 2 - last : -(track.scrollWidth - window.innerWidth * 0.55);
      // The first card's centre starts exactly on the right edge, so it arrives as the hero clears.
      const start = first ? window.innerWidth - first : window.innerWidth * 0.75;
      return { start, end };
    };
    const speed = lite ? CARD_SPEED_LITE : CARD_SPEED;
    const setHeight = (): void => {
      measure();
      const { start, end } = range();
      wrap.style.height = `${window.innerHeight + clearHero() + (start - end) / speed}px`;
    };
    setHeight();

    // Scroll progress (0..1) through the carousel is the target; the display follows it smoothly.
    let targetP = 0;
    let curP = 0;
    let lastTarget = 0;
    let tVel = 0;
    let lastX = range().start;
    let vel = 0;
    let inView = false;
    let firstEntering = 0;
    let activeCard = -1;
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (ev: PointerEvent): void => {
      ptr.tx = (ev.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = (ev.clientY / window.innerHeight) * 2 - 1;
    };
    if (!lite) window.addEventListener('pointermove', onPointer, { passive: true });

    const apply = (p: number, dt: number): void => {
      const vw = window.innerWidth;
      const { start, end } = range();
      const x = mix(start, end, p);
      track.style.transform = `translate3d(${x}px,0,0)`;
      vel = vel * 0.6 + (x - lastX) * 0.4;
      lastX = x;
      const k = 1 - Math.exp(-6 * dt);
      ptr.x += (ptr.tx - ptr.x) * k;
      ptr.y += (ptr.ty - ptr.y) * k;

      if (lite) {
        let best = 0;
        let bestF = -1;
        CARDS.forEach((_, i) => {
          const outer = wrapperRefs.current[i];
          if (!outer) return;
          const cx = x + centres[i];
          const d = (cx - vw / 2) / (vw * 0.42);
          const f0 = clamp01(1 - Math.abs(d));
          const f = f0 * f0 * (3 - 2 * f0);
          if (i === 0) firstEntering = clamp01((vw - cx) / (vw * 0.5));
          if (f > bestF) {
            bestF = f;
            best = i;
          }
          const enter = clamp01((vw * 0.98 - cx) / (vw * 0.26));
          const leave = clamp01((vw * 0.1 - cx) / (vw * 0.25));
          const op = (Math.round(enter * (1 - leave * 0.8) * (0.55 + 0.45 * f) * 50) / 50).toFixed(2);
          const sc = (0.86 + 0.14 * f).toFixed(3);
          if (outer.dataset.op !== op) {
            outer.dataset.op = op;
            outer.style.opacity = op;
          }
          outer.style.transform = `translate3d(0,0,0) scale(${sc})`;
        });
        if (best !== activeCard) {
          activeCard = best;
          CARDS.forEach((_, i) => {
            const outer = wrapperRefs.current[i];
            if (outer) outer.dataset.active = i === best ? 'true' : 'false';
          });
          const rgb = rgbRef.current[best];
          if (mood && rgb) mood.style.backgroundColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.34)`;
        }
        if (mood) {
          const mo = (Math.round((firstEntering < 0.05 ? 0 : Math.min(1, bestF * 1.4) * firstEntering) * 25) / 25).toFixed(2);
          if (mood.dataset.op !== mo) {
            mood.dataset.op = mo;
            mood.style.opacity = mo;
          }
        }
        return;
      }

      let sumF = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      CARDS.forEach((_, i) => {
        const outer = wrapperRefs.current[i];
        const img = imgRefs.current[i];
        if (!outer || !img) return;
        const cx = x + centres[i]; // card centre on screen
        const d = (cx - vw / 2) / (vw * 0.42); // -1..1 around the middle, beyond at the sides
        const ad = Math.abs(d);
        const f0 = clamp01(1 - ad);
        const f = f0 * f0 * (3 - 2 * f0); // focus: 0 far away, 1 at the centre
        if (i === 0) firstEntering = clamp01((vw - cx) / (vw * 0.5));
        const rgb = rgbRef.current[i];
        if (rgb) {
          sumF += f;
          sumR += rgb[0] * f;
          sumG += rgb[1] * f;
          sumB += rgb[2] * f;
        }

        const enter = clamp01((vw * 0.98 - cx) / (vw * 0.26));
        const leave = clamp01((vw * 0.1 - cx) / (vw * 0.25));
        const opacity = enter * (1 - leave * 0.8) * (0.5 + 0.5 * f);

        // Straight, flat cards: no rotation or bending. Depth comes only from scale and distance.
        const z = -ad * 170 + f * 110;
        const y = -f * 8;
        const sc = 0.78 + 0.26 * f;

        outer.style.opacity = opacity.toFixed(3);
        outer.style.transform = `translate3d(0,${y.toFixed(1)}px,${z.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        // Drive the card's glow, gloss, frame and text from these.
        outer.style.setProperty('--f', f.toFixed(3));
        img.style.transform = `translate3d(${(-d * 38).toFixed(1)}px,0,0) scale(${(1.2 + 0.1 * f).toFixed(3)})`;
      });

      // Background takes the selected (focused) card's colour, crossfading as the focus moves on.
      if (mood) {
        if (sumF > 0.001) {
          const k2 = 1 - Math.exp(-7 * dt);
          blend[0] += (sumR / sumF - blend[0]) * k2;
          blend[1] += (sumG / sumF - blend[1]) * k2;
          blend[2] += (sumB / sumF - blend[2]) * k2;
        }
        const c = `${Math.round(blend[0])},${Math.round(blend[1])},${Math.round(blend[2])}`;
        mood.style.background = `radial-gradient(75% 70% at 50% 46%, rgba(${c},0.58), rgba(${c},0.34) 55%, rgba(${c},0.2))`;
        // Only visible once the first card has arrived (never over the hero or later sections).
        mood.style.opacity = String(firstEntering < 0.05 ? 0 : Math.min(1, sumF * 1.4) * firstEntering);
      }
      // Streaks of light brighten with speed and fade away when scrolling stops.
      if (lines) lines.style.opacity = String(Math.min(1, Math.abs(vel) / 30) * 0.95);
    };

    /** Scroll-progress positions at which each card sits exactly in the middle. */
    const centreProgress = (): number[] => {
      const { start, end } = range();
      return centres.map((c) => (window.innerWidth / 2 - c - start) / (end - start));
    };

    const tick = (_time: number, deltaMs: number): void => {
      if (!inView) return;
      const dt = Math.min(deltaMs / 1000, 0.05) || 0.016;
      tVel = tVel * 0.8 + ((targetP - lastTarget) / dt) * 0.2;
      lastTarget = targetP;

      // Soft magnet: once scrolling settles, the nearest card drifts to the centre.
      let desired = targetP;
      const pc = centreProgress();
      if (pc.length && targetP > pc[0] - 0.015 && targetP < pc[pc.length - 1] + 0.015) {
        let best = pc[0];
        pc.forEach((v) => {
          if (Math.abs(v - targetP) < Math.abs(best - targetP)) best = v;
        });
        const settled = 1 - clamp01(Math.abs(tVel) / 0.12);
        desired = targetP + (best - targetP) * 0.88 * settled * settled;
      }
      curP += (desired - curP) * (1 - Math.exp(-8 * dt));
      apply(curP, dt);
    };

    ScrollTrigger.addEventListener('refreshInit', setHeight);
    gsap.ticker.add(tick);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          inView = self.isActive;
        },
      });

      // Phase 1: the hero text clears while the logo zooms; a flash of light marks the hand-over.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: wrap, start: 'top top', end: () => `top+=${clearHero()} top`, scrub: 0.2 },
        })
        .to(hero, { y: -70, autoAlpha: 0, ...(lite ? {} : { filter: 'blur(8px)' }), duration: 0.7 }, 0.05)
        .fromTo('[data-stage-ui]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.7)
        .fromTo('[data-stage-flare]', { opacity: 0, scale: 0.3 }, { opacity: 0.9, scale: 1.5, duration: 0.3 }, 0.6)
        .to('[data-stage-flare]', { opacity: 0, duration: 0.25 }, 0.92);

      // Phase 2: scroll sets the target; the ticker eases the cards toward it.
      ScrollTrigger.create({
        trigger: wrap,
        start: () => `top+=${clearHero() * 0.8} top`,
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetP = self.progress;
        },
        onRefresh: (self) => {
          targetP = self.progress;
          curP = self.progress;
        },
      });
    }, wrap);
    apply(0, 0.016);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onPointer);
      ScrollTrigger.removeEventListener('refreshInit', setHeight);
      ctx.revert();
      if (hero) gsap.set(hero, { clearProps: 'all' });
      wrap.style.height = '';
    };
  }, [reduced, lite]);

  // The wrapper overlaps the whole first screen, so it must ignore the pointer; only the cards take clicks.
  return (
    <div ref={wrapRef} className={`pointer-events-none relative z-20 ${reduced ? '' : '-mt-[100vh]'}`}>
      <div className="pointer-events-none sticky top-0 h-screen overflow-hidden [contain:paint]">
        <div
          className={`absolute inset-0 flex items-center ${lite ? '' : '[perspective-origin:50%_50%] [perspective:1400px]'} ${
            reduced ? 'overflow-x-auto' : 'overflow-hidden'
          }`}
        >
          {/* Background wash: the selected card's colour, set every frame by the scroll loop */}
          <div
            ref={moodRef}
            className={`pointer-events-none absolute inset-0 opacity-0 [mask-image:linear-gradient(to_bottom,#000_78%,transparent)] ${
              lite ? 'transition-[background-color] duration-700' : ''
            }`}
            aria-hidden="true"
          />

          {/* Streaks of light rushing across the screen: they brighten with scroll speed */}
          <div data-speed-lines className={`pointer-events-none absolute inset-0 overflow-hidden opacity-0 ${lite ? 'hidden' : ''}`} aria-hidden="true">
            {SPEED_LINES.map((l, i) => (
              <span
                key={i}
                className={`absolute right-0 h-px animate-speed rounded-full ${
                  l.red
                    ? 'bg-gradient-to-r from-transparent via-brand-red/60 to-brand-red shadow-[0_0_14px_2px_rgba(255,0,60,0.6)]'
                    : 'bg-gradient-to-r from-transparent via-white/40 to-white shadow-[0_0_12px_1px_rgba(255,255,255,0.45)]'
                }`}
                style={{
                  top: `${l.top}%`,
                  width: `${l.w}vw`,
                  animationDuration: `${l.d}s`,
                  animationDelay: `-${(i * 0.37) % l.d}s`,
                }}
              />
            ))}
          </div>

          {/* Flash of light as the first card arrives */}
          <div className="pointer-events-none absolute inset-y-0 -right-[10vw] flex items-center" aria-hidden="true">
            <div
              data-stage-flare
              className={`h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(255,40,70,0.4),rgba(255,40,70,0.2)_40%,transparent_70%)] opacity-0 ${lite ? '' : 'blur-2xl'}`}
            />
          </div>

          <p
            data-stage-ui
            className="absolute left-5 top-24 z-10 text-xs uppercase tracking-[0.28em] text-brand-cyan [text-shadow:0_0_14px_rgba(0,207,255,0.7)] md:left-10 md:top-28"
          >
            {WORK.eyebrow}
          </p>
          <p
            data-stage-ui
            className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.28em] text-white/55"
          >
            Click a card to open the project
          </p>

          <div
            ref={trackRef}
            className={`relative flex w-max items-center gap-[3vw] pl-[4vw] pr-[20vw] will-change-transform ${lite ? '' : '[transform-style:preserve-3d]'}`}
          >
            {CARDS.map((card, i) => (
              <div
                key={card.slug}
                ref={(el) => {
                  wrapperRefs.current[i] = el;
                }}
                data-card-in
                className="group/c pointer-events-auto relative shrink-0 will-change-transform [backface-visibility:hidden]"
                // --c: this card's colour. --f / --gx / --gy / --sx are updated every frame by the scroll loop.
                data-active="false"
                style={{ '--c': colors[i], '--f': lite ? 1 : 0.5, '--gx': '50%', '--gy': '50%', '--sx': '50%' } as CSSProperties}
              >
                {/* Contact glow on the "floor" under the card, stronger when the card is in focus */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-9 left-[6%] right-[6%] h-10 rounded-[50%] blur-2xl ${
                    lite ? 'opacity-30 transition-opacity duration-500 group-data-[active=true]/c:opacity-100' : ''
                  }`}
                  style={{ background: lite ? 'rgba(var(--c), 0.7)' : 'rgba(var(--c), calc(0.12 + var(--f) * 0.7))' }}
                />
                <button
                  type="button"
                  aria-label={`Open project: ${card.title}, ${card.subtitle}`}
                  onClick={(ev) => openCard(i, ev.currentTarget)}
                  className="group relative block h-[62vh] w-[78vw] cursor-pointer overflow-hidden rounded-[1.75rem] border text-left sm:w-[52vw] md:h-[68vh] lg:w-[min(38vw,40rem)]"
                  style={
                    lite
                      ? { borderColor: 'rgba(255,255,255,0.22)', boxShadow: '0 28px 60px -28px rgba(var(--c), 0.6)' }
                      : {
                          borderColor: 'rgba(255,255,255,calc(0.12 + var(--f) * 0.5))',
                          boxShadow:
                            '0 40px 110px -24px rgba(var(--c), calc(0.15 + var(--f) * 0.7)), 0 0 calc(var(--f) * 70px) rgba(var(--c), calc(var(--f) * 0.45))',
                        }
                  }
                >
                  <img
                    ref={(el) => {
                      imgRefs.current[i] = el;
                    }}
                    src={card.image}
                    alt={card.alt}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/85 via-transparent to-brand-bg/15" />
                  {/* Neon frame that tightens in when the card is in focus */}
                  <div
                    className={`pointer-events-none absolute inset-3 rounded-[1.35rem] border border-white/60 ${
                      lite ? 'opacity-0 transition-opacity duration-500 group-data-[active=true]/c:opacity-100' : ''
                    }`}
                    style={lite ? undefined : { opacity: 'var(--f)', transform: 'scale(calc(0.94 + var(--f) * 0.06))' }}
                  />
                  {/* "Open" cue, visible on the focused card */}
                  <span
                    className={`pointer-events-none absolute left-6 top-6 rounded-full border border-white/40 bg-brand-bg/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] md:bg-brand-bg/55 md:backdrop-blur-md ${
                      lite ? 'opacity-0 transition-opacity duration-500 group-data-[active=true]/c:opacity-100' : ''
                    }`}
                    style={lite ? undefined : { opacity: 'var(--f)' }}
                  >
                    View project →
                  </span>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8"
                    style={lite ? undefined : { transform: 'translateY(calc((1 - var(--f)) * 16px))' }}
                  >
                    <div style={lite ? undefined : { transform: 'scale(calc(0.94 + var(--f) * 0.08))', transformOrigin: 'left bottom' }}>
                      <p
                        className="text-[11px] uppercase tracking-[0.22em] text-brand-cyan"
                        style={lite ? undefined : { opacity: 'calc(0.55 + var(--f) * 0.45)' }}
                      >
                        {card.subtitle}
                      </p>
                      <p className="mt-1 font-display text-3xl font-semibold md:text-5xl">{card.title}</p>
                    </div>
                    <span className="font-display text-sm text-white/60">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
