import { Fragment } from 'react';

/** Paragraph whose words light up one by one as you scroll past it (see `useReveal`). */
export default function ScrubText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p data-scrub-text className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 ? ' ' : null}
          <span data-scrub-word className="inline-block opacity-35">
            {word}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
