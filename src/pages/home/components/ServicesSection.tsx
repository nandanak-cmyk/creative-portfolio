import { SERVICES } from '../content';

import GlassCard from './GlassCard';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import Tag from './Tag';
import SectionBackdrop from './SectionBackdrop';

export default function ServicesSection() {
  return (
    <section id="services"  className="relative px-5 py-28 md:px-10 md:py-40">
      <SectionBackdrop variant="services" />
      <div data-float="-160" className="pointer-events-none absolute left-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,0,60,0.14),transparent)] blur-2xl" />
      <div data-float="140" className="pointer-events-none absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(0,107,255,0.14),transparent)] blur-2xl" />

      <div className="relative mx-auto max-w-7xl md:flex md:justify-end">
        <div className="md:w-[62%]">
          <SectionLabel>{`${SERVICES.eyebrow} · 01 / ${String(SERVICES.items.length).padStart(2, '0')}`}</SectionLabel>
          <SplitHeadline
            text={SERVICES.headline}
            className="font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {SERVICES.items.map((s, i) => (
              <GlassCard key={s.index} data-reveal data-delay={i * 0.07} className="p-6">
                <span className="neon-liquid font-display text-sm">{s.index}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-white/70">{s.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
