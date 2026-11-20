import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import { introReady } from '@/shared/intro-gate';

const GLYPHS = '01<>/\\_+*#ABCDEFGHJKLMNPQRSTUVWXYZ';

interface ScrambleTextProps {
  text: string;
  delay?: number;
  className?: string;
}

/** Decodes the text from random glyphs, left to right, once the intro hands over. */
export default function ScrambleText({ text, delay = 0, className }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const state = { p: 0 };
    let tween: gsap.core.Tween | undefined;
    let cancelled = false;

    // Hold the line blank (keeping its width) until it is time to decode.
    el.textContent = text.replace(/[^ ·]/g, ' ');

    void introReady.then(() => {
      if (cancelled) return;
      tween = gsap.to(state, {
        p: 1,
        duration: 1.1,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          const settled = Math.floor(state.p * text.length);
          el.textContent = text
            .split('')
            .map((ch, i) =>
              i < settled || ch === ' ' || ch === '·' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join('');
        },
        onComplete: () => {
          el.textContent = text;
        },
      });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      el.textContent = text;
    };
  }, [text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}
