import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, type RefObject } from 'react';

import { introReady } from '@/shared/intro-gate';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-driven motion for the page. Starts once the opening sequence hands over.
 *  - `[data-split]`        : words fly up from a mask, skewed and fast
 *  - `[data-reveal]`       : fade + lift (blur to sharp)
 *  - `[data-parallax]`     : drifts against the scroll from the top of the page (px)
 *  - `[data-float]`        : drifts while it crosses the viewport (px) - for glows and decor
 *  - `[data-scrub-text]`   : words light up one by one with scroll
 *  - `[data-scrub-card]`   : tilts up into place with scroll
 *  - `[data-drift]`        : oversized type sliding sideways with scroll (% of its width)
 *  - `[data-scrub-line]`   : a line that draws itself with scroll progress
 * `data-delay` (seconds) offsets split/reveal elements.
 */
export function useReveal(root: RefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    let ctx: gsap.Context | undefined;

    void introReady.then(() => {
      if (cancelled) return;
      const touch = window.matchMedia('(pointer: coarse)').matches;
      ctx = gsap.context(() => {
        // Headlines: words slide in from the sides, alternating left and right, and settle in a line.
        gsap.utils.toArray<HTMLElement>('[data-split]').forEach((block) => {
          const words = block.querySelectorAll<HTMLElement>('[data-word]');
          words.forEach((w, i) => {
            gsap.fromTo(
              w,
              { x: i % 2 === 0 ? -110 : 110, opacity: 0, skewX: i % 2 === 0 ? 10 : -10 },
              {
                x: 0,
                opacity: 1,
                skewX: 0,
                duration: 0.8,
                ease: 'expo.out',
                delay: Number(block.dataset.delay ?? 0) + i * 0.04,
                clearProps: 'transform,opacity',
                scrollTrigger: { trigger: block, start: 'top bottom-=60', once: true },
              },
            );
          });
        });

        // Everything else that reveals (labels, paragraphs, tabs, cards) glides in from alternating sides too.
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((node, i) => {
          gsap.fromTo(
            node,
            { x: i % 2 === 0 ? -90 : 90, y: 24, opacity: 0 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'power4.out',
              clearProps: 'transform,opacity',
              delay: Number(node.dataset.delay ?? 0),
              scrollTrigger: { trigger: node, start: 'top bottom-=40', once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((node) => {
          if (touch) return; // scroll-driven drifting layers flicker on phones
          gsap.to(node, {
            y: Number(node.dataset.parallax ?? -60),
            ease: 'none',
            scrollTrigger: { trigger: node.parentElement ?? node, start: 'top top', end: 'bottom top', scrub: 0.6 },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-float]').forEach((node) => {
          if (touch) return; // scroll-driven drifting layers flicker on phones
          const px = Number(node.dataset.float ?? -120);
          gsap.fromTo(
            node,
            { y: -px },
            {
              y: px,
              ease: 'none',
              scrollTrigger: { trigger: node.parentElement ?? node, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-scrub-text]').forEach((block) => {
          gsap.to(block.querySelectorAll('[data-scrub-word]'), {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: block, start: 'top 82%', end: 'bottom 48%', scrub: 0.4 },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-scrub-card]').forEach((card) => {
          gsap.fromTo(
            card,
            { y: 90, rotateX: 14, scale: 0.93, transformPerspective: 1000 },
            {
              y: 0,
              rotateX: 0,
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 58%', scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((node) => {
          if (touch) return; // scroll-driven drifting layers flicker on phones
          gsap.fromTo(
            node,
            { xPercent: 0 },
            {
              xPercent: Number(node.dataset.drift ?? -15),
              ease: 'none',
              scrollTrigger: { trigger: node.parentElement ?? node, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
            },
          );
        });

        // Sections after About: the content rises into place as the section arrives (not on phones).
        gsap.utils.toArray<HTMLElement>('[data-section-rise]').forEach((node) => {
          if (touch) return;
          gsap.fromTo(
            node,
            { y: 80 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: { trigger: node, start: 'top bottom', end: 'top 45%', scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-scrub-line]').forEach((line) => {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: line.parentElement ?? line, start: 'top 70%', end: 'bottom 70%', scrub: 0.4 },
            },
          );
        });
      }, el);
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [root]);
}
