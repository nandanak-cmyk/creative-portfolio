import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

import { ABOUT } from '../content';
import { getLenis } from '../hooks/use-smooth-scroll';

import AboutPhotoWall from './AboutPhotoWall';
import ScrubText from './ScrubText';
import SectionBackdrop from './SectionBackdrop';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';

gsap.registerPlugin(ScrollTrigger);

/**
 * Split layout: the studio's story on the left, a photo wall of its work on the right.
 *
 * It opens like a new page, and the page that opens IS this section (no separate title screen). When the
 * gallery ends, scrolling pauses and About is pinned over the window and swept in from right to left, led by
 * a bright edge of light, its content sliding in behind. It is then released back into the page at exactly the
 * same spot, so there is no visible jump. Reduced motion skips all of it.
 */
export default function AboutSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const section = sectionRef.current;
    const edge = edgeRef.current;
    if (!wrap || !section || !edge || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    // Phones: pinning a section over the window while the address bar resizes makes the page jump and flash, and the
    // stacked layout is taller than the screen. There the section scrolls in normally, and its text and pictures
    // slide in from the sides as they come into view.
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
      const ctx = gsap.context(() => {
        const text = section.querySelector('[data-about-text]');
        const wall = section.querySelector('[data-about-wall]');
        const slide = (el: Element | null, x: number, delay = 0): void => {
          if (!el) return;
          gsap.fromTo(
            el,
            { x, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.9,
              delay,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            },
          );
        };
        slide(text, -70);
        slide(wall, 70, 0.1);
      }, section);
      return () => ctx.revert();
    }

    let busy = false;
    let timeline: gsap.core.Timeline | null = null;
    const html = document.documentElement;
    // Ignore the trigger while the page is still settling (e.g. returning with Back restores a scroll position
    // inside About): only the visitor's own scrolling should open the page.
    let armed = false;
    let triggered = false;
    // The moment is when the third section's "The work, in motion" line reaches the top of the screen.
    const cue = document.querySelector<HTMLElement>('[data-gallery-copy] p') ?? wrap;
    const CUE_START = 'top 12%';
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 1200);

    gsap.set(edge, { opacity: 0 });

    const release = (): void => {
      // The pinned section and the in-flow section look identical at this scroll position, so swapping is invisible.
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
      gsap.set(section, { clearProps: 'position,top,left,width,height,zIndex,clipPath,overflow,opacity,visibility' });
      wrap.style.height = '';
      ScrollTrigger.refresh();
      html.style.overflow = '';
      lenis?.start();
      gsap.set(edge, { opacity: 0 });
      busy = false;
    };

    const tryOpen = (): void => {
      if (!triggered || busy) return;
      if (!armed) {
        gsap.set(section, { autoAlpha: 1 }); // returning with Back: show it as it is
        return;
      }
      openPage();
    };

    const openPage = (): void => {
      if (busy) return;
      busy = true;
      gsap.set(section, { autoAlpha: 1 });
      window.dispatchEvent(new Event('about-open'));
      getLenis()?.stop();
      html.style.overflow = 'hidden';

      // Keep the page's length while the section is lifted out of the flow, then pin it over the window.
      const height = section.getBoundingClientRect().height;
      wrap.style.height = `${height}px`;
      const text = section.querySelector('[data-about-text]');
      const tiles = section.querySelectorAll('[data-wall-tile]');

      gsap.set(section, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height,
        zIndex: 80,
        overflow: 'hidden',
        clipPath: 'inset(0% 0% 0% 100%)',
      });
      // The words arrive from the left and the pictures from the right, so the two halves meet in the middle.
      gsap.set(text, { x: -130, opacity: 0 });
      gsap.set(tiles, { x: 130, scale: 0.92, opacity: 0 });

      timeline = gsap
        .timeline({ onComplete: release })
        // The section sweeps in from the right...
        .to(section, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.inOut' }, 0)
        // ...led by a bright edge of light.
        .fromTo(edge, { left: '100%', opacity: 1 }, { left: '0%', duration: 0.5, ease: 'power3.inOut' }, 0)
        .to(edge, { opacity: 0, duration: 0.15 }, 0.4)
        // Its content slides in behind the edge.
        .to(text, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0)
        .to(tiles, { x: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.04 }, 0.05);
    };

    // Fires when the cue line reaches the top of the screen while scrolling down.
    const trigger = ScrollTrigger.create({
      trigger: cue,
      start: CUE_START,
      onEnter: () => {
        triggered = true;
        tryOpen();
      },
    });
    // Not reached yet: keep About out of sight until its moment comes.
    if (cue.getBoundingClientRect().top > window.innerHeight * 0.12) {
      gsap.set(section, { autoAlpha: 0 });
    }

    return () => {
      window.clearTimeout(armTimer);
      trigger.kill();
      timeline?.kill();
      html.style.overflow = '';
      getLenis()?.start();
      gsap.set(section, { clearProps: 'position,top,left,width,height,zIndex,clipPath,overflow,opacity,visibility' });
      wrap.style.height = '';
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      {/* Edge of light that leads the sweep (fixed to the window while it plays) */}
      <div ref={edgeRef} aria-hidden="true" className="pointer-events-none fixed inset-y-0 z-[90] w-0 opacity-0">
        <div className="absolute inset-y-0 -left-12 w-24 bg-[radial-gradient(closest-side,rgba(255,60,90,0.55),rgba(80,120,255,0.25)_55%,transparent)] blur-xl" />
        <div className="h-full w-[2px] bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_28px_5px_rgba(255,0,60,0.75),0_0_64px_10px_rgba(60,110,255,0.5)]" />
      </div>

      <section ref={sectionRef} id="about" className="relative bg-brand-bg px-5 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24">
        <SectionBackdrop variant="about" />

        <div data-about-content className="relative mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div data-about-text>
            <SectionLabel plain>{ABOUT.eyebrow}</SectionLabel>
            <SplitHeadline
              text={ABOUT.headline}
              plain
              className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            />
            <ScrubText text={ABOUT.text} className="mt-8 text-lg leading-relaxed text-brand-white md:text-2xl md:leading-snug" />
            {/* A handwritten sign-off, the way a person would close a note */}
            <p data-reveal className="mt-10 -rotate-2 font-hand text-3xl text-[#f4efe8]/90 md:text-4xl">
              — the Adviciya team
              <svg aria-hidden="true" viewBox="0 0 200 12" className="mt-1 h-2 w-40 text-brand-red">
                <path className="hand-stroke" d="M2 7 C 40 1, 80 11, 120 5 S 175 3, 198 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="1" />
              </svg>
            </p>
          </div>

          <div data-about-wall>
            <AboutPhotoWall />
          </div>
        </div>
      </section>
    </div>
  );
}
