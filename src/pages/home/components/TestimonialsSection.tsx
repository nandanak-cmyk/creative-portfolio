import { TESTIMONIALS } from '../content';

import GlassCard from './GlassCard';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import SectionBackdrop from './SectionBackdrop';

export default function TestimonialsSection() {
  return (
    <section id="testimonials"  className="relative px-5 py-28 md:px-10 md:py-40">
      <SectionBackdrop variant="testimonials" />
      <div className="relative mx-auto max-w-7xl">
        <SectionLabel>{TESTIMONIALS.eyebrow}</SectionLabel>
        <SplitHeadline
          text={TESTIMONIALS.headline}
          className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.items.map((t, i) => (
            <GlassCard key={t.quote} as="figure" data-reveal data-delay={i * 0.08} className="flex flex-col p-8">
              <span className="neon-liquid font-display text-6xl leading-none" aria-hidden="true">
                “
              </span>
              <blockquote className="mt-2 flex-1 text-base leading-relaxed text-brand-white/85">{t.quote}</blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-5">
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="mt-1 text-xs text-white/50">{t.role}</p>
              </figcaption>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
