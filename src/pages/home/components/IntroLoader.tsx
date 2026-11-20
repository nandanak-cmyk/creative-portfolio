import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, useState } from 'react';

import { introPlayed, releaseIntro } from '@/shared/intro-gate';

import { BRAND, BRAND_TAGLINE } from '../content';

gsap.registerPlugin(ScrollTrigger);

const MAX_WAIT_MS = 5000;

/**
 * Opening sequence: the wordmark rises letter by letter while a counter runs to 100,
 * then the letters lift away and the screen opens like doors along a neon seam,
 * releasing the page's own animations as it does.
 */
export default function IntroLoader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    // Already played in this visit (e.g. returning from a project page): skip straight to the page.
    if (!root || introPlayed() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      releaseIntro();
      setDone(true);
      return undefined;
    }

    const html = document.documentElement;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let killed = false;
    const q = <T extends Element>(sel: string): T[] => gsap.utils.toArray<T>(sel, root);
    const letters = q<HTMLElement>('[data-intro-letter]');
    const counterEl = root.querySelector<HTMLElement>('[data-intro-count]');
    const counter = { v: 0 };

    // Make sure the hero artwork is cached before the doors open.
    const imageReady = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = '/hero-logo.webp';
    });

    const intro = gsap.timeline();
    intro
      // fromTo (explicit start AND end), never from(): React dev mode mounts twice, and a second from()
      // would read the already-hidden state as its end state and animate nothing.
      .fromTo(
        letters,
        { yPercent: 125, rotate: 9, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 0.95, ease: 'expo.out', stagger: 0.055 },
      )
      .fromTo('[data-intro-sub]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.5)
      .to('[data-intro-bar]', { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 0.1)
      .to(
        counter,
        {
          v: 100,
          duration: 1.9,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counterEl) counterEl.textContent = String(Math.round(counter.v)).padStart(3, '0');
          },
        },
        0.1,
      );

    const wait = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT_MS));
    void Promise.race([Promise.all([intro.then(), imageReady]), wait]).then(() => {
      if (killed) return;
      // The screen is still fully covered here, so the page can set up its reveals unseen.
      releaseIntro();

      gsap
        .timeline({
          onComplete: () => {
            window.scrollTo(0, 0);
            html.style.overflow = '';
            setDone(true);
            ScrollTrigger.refresh();
          },
        })
        .to(letters, { yPercent: -130, opacity: 0, duration: 0.6, ease: 'power4.in', stagger: 0.03 })
        .to(q('[data-intro-ui]'), { opacity: 0, duration: 0.3 }, 0)
        .fromTo('[data-intro-seam]', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }, 0.3)
        .to('[data-intro-top]', { yPercent: -101, duration: 1.15, ease: 'expo.inOut' }, 0.75)
        .to('[data-intro-bottom]', { yPercent: 101, duration: 1.15, ease: 'expo.inOut' }, 0.75)
        .to('[data-intro-seam]', { opacity: 0, duration: 0.35 }, 0.95);
    });

    return () => {
      killed = true;
      intro.kill();
      html.style.overflow = '';
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} aria-hidden="true" className="fixed inset-0 z-[100]">
      {/* The two doors */}
      <div
        data-intro-top
        className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,#1a0a10,#070508_70%)]"
      />
      <div
        data-intro-bottom
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_0%,#1a0a10,#070508_70%)]"
      />
      <div
        data-intro-seam
        className="absolute left-0 right-0 top-1/2 h-[2px] origin-center -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-0 shadow-[0_0_50px_8px_rgba(255,0,60,0.85),0_0_110px_18px_rgba(0,107,255,0.6)]"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <h1 className="flex pb-4 font-display text-[18vw] font-semibold leading-none tracking-tight md:text-[9rem]">
          {`${BRAND}.`.split('').map((ch, i) => (
            <span key={`${ch}-${i}`} className="overflow-hidden pb-[0.22em]">
              <span data-intro-letter className={`inline-block ${ch === '.' ? 'neon-liquid' : 'neon-chrome'}`}>
                {ch}
              </span>
            </span>
          ))}
        </h1>
        <p data-intro-sub data-intro-ui className="mt-2 text-xs uppercase tracking-[0.4em] text-brand-cyan [text-shadow:0_0_14px_rgba(0,207,255,0.7)]">
          {BRAND_TAGLINE}
        </p>

        <div data-intro-ui className="mt-12 flex w-[min(80vw,22rem)] items-center gap-4">
          <div className="h-px flex-1 bg-white/15">
            <div
              data-intro-bar
              className="h-full origin-left scale-x-0 bg-gradient-to-r from-brand-red via-brand-blue to-brand-cyan shadow-[0_0_12px_#FF003C]"
            />
          </div>
          <span data-intro-count className="w-10 text-right font-display text-sm tabular-nums text-white/70">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
