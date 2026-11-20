import { Fragment, type ElementType } from 'react';

interface SplitHeadlineProps {
  /** Wrap words in *asterisks* to render them with the red/blue liquid-neon fill. */
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}

/** Masked word-by-word headline with a neon-chrome fill, animated by `useReveal`. */
export default function SplitHeadline({ text, as: Tag = 'h2', className = '', delay = 0 }: SplitHeadlineProps) {
  const parts = text.split('*');
  const words = parts.flatMap((part, i) =>
    part
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, accent: i % 2 === 1 })),
  );

  return (
    <Tag className={`neon-glow ${className}`} data-split data-delay={delay}>
      {words.map(({ word, accent }, i) => (
        <Fragment key={`${word}-${i}`}>
          {/* A real space between words keeps the heading readable to assistive tech and copy/paste. */}
          {i > 0 ? ' ' : null}
          <span className="inline-block overflow-hidden pb-[0.16em] align-top">
            <span data-word className={`inline-block will-change-transform ${accent ? 'neon-liquid' : 'neon-chrome'}`}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
