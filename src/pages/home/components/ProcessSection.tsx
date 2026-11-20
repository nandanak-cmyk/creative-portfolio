import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

import { PROCESS } from '../content';

import SectionBackdrop from './SectionBackdrop';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';

gsap.registerPlugin(ScrollTrigger);

const STEPS = PROCESS.steps;
/** Where the first card sticks, from the top of the window, and how far each next card sits lower so its edge peeks out. */
const STICK_TOP_REM = 6.5;
const STICK_STEP_REM = 1.4;

/**
 * Scroll stack: the four steps are cards that stack up as you scroll. Each card slides up and rests over the previous
 * one (which sits a little lower each time so every edge stays visible); as the next card arrives, the one beneath
 * shrinks back and fades, then the stack moves on together.
 */
export default function ProcessSection() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]');
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const nextTop = (STICK_TOP_REM + (i + 1) * STICK_STEP_REM) * rem;
        // From the moment the next card starts to cover this one, until it has settled on top.
        gsap.fromTo(
          card,
          { scale: 1, opacity: 1 },
          {
            scale: 0.92,
            opacity: 0.35,
            ease: 'none',
            transformOrigin: '50% 0%',
            scrollTrigger: {
              trigger: next,
              start: () => `top ${Math.round(nextTop + card.offsetHeight * 0.7)}px`,
              end: () => `top ${Math.round(nextTop)}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="process" className="relative px-5 py-14 md:px-10 md:py-20">
      <SectionBackdrop variant="process" />
      <div data-float="-160" className="pointer-events-none absolute right-0 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(0,207,255,0.1),transparent)] blur-2xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <SectionLabel>{PROCESS.eyebrow}</SectionLabel>
          <SplitHeadline
            text={PROCESS.headline}
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          />
        </div>

        {/* The stack. Each card sticks as it reaches its place; the gap under each one is the scroll it takes to arrive. */}
        <ol className="mt-14 md:mt-20">
          {STEPS.map((step, i) => (
            <li
              key={step.index}
              data-stack-card
              className="sticky mb-10 origin-top will-change-transform last:mb-0 md:mb-16"
              style={{ top: `${STICK_TOP_REM + i * STICK_STEP_REM}rem`, zIndex: i + 1 }}
            >
              <article className="relative isolate min-h-[26rem] overflow-hidden rounded-[1.75rem] border border-white/20 shadow-[0_-24px_80px_-30px_rgba(255,0,60,0.5)] md:min-h-[30rem] md:rounded-[2.25rem]">
                {/* The picture fills the whole card: there is no empty panel */}
                <img
                  src={step.image}
                  alt={step.imageAlt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
                {/* Shade for the words: from the bottom on phones, from the text's side on wide screens */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#050507]/95 via-[#050507]/45 to-transparent md:bg-gradient-to-r md:via-[#050507]/55 md:to-transparent ${
                    i % 2 === 1 ? 'md:from-transparent md:via-[#050507]/55 md:to-[#050507]/90' : 'md:from-[#050507]/90'
                  }`}
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-3 -z-10 rounded-[1.4rem] border border-white/15 md:rounded-[1.9rem]" />

                <div
                  className={`flex min-h-[26rem] flex-col justify-between gap-8 p-6 md:min-h-[30rem] md:w-[52%] md:p-12 ${
                    i % 2 === 1 ? 'md:ml-auto md:text-right md:items-end' : ''
                  }`}
                >
                  <div className={`flex w-full items-start justify-between gap-4 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <span className="neon-liquid font-display text-7xl font-semibold leading-none md:text-9xl">{step.index}</span>
                    <span className="mt-2 rounded-full border border-white/25 bg-[#050507]/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/80">
                      Step {step.index} / {String(STEPS.length).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-4xl font-semibold leading-tight md:text-6xl">{step.title}</h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-brand-white/85 md:text-lg">{step.text}</p>
                    {/* Where we are in the four steps */}
                    <div className={`mt-6 flex items-center gap-2 ${i % 2 === 1 ? 'md:justify-end' : ''}`} aria-hidden="true">
                      {STEPS.map((s, k) => (
                        <span
                          key={s.index}
                          className={`h-1 rounded-full ${k === i ? 'w-10 bg-gradient-to-r from-brand-red to-brand-blue' : 'w-4 bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
