import { EXPERTISE } from '../content';

import GlassCard from './GlassCard';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import SectionBackdrop from './SectionBackdrop';

export default function ExpertiseSection() {
  return (
    <section id="expertise"  className="relative px-5 py-28 md:px-10 md:py-40">
      <SectionBackdrop variant="expertise" />
      <div data-float="-160" className="pointer-events-none absolute left-[calc(50%-25rem)] top-[calc(50%-17rem)] h-[34rem] w-[50rem] max-w-full rounded-full bg-[radial-gradient(closest-side,rgba(255,0,60,0.12),rgba(0,107,255,0.1)_60%,transparent)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <SectionLabel>{EXPERTISE.eyebrow}</SectionLabel>
        <SplitHeadline
          text={EXPERTISE.headline}
          className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {EXPERTISE.groups.map((group, g) => (
            <GlassCard key={group.title} as="div" data-reveal data-delay={g * 0.1} className="p-8">
              <h3 className="neon-liquid inline-block font-display text-2xl font-semibold">{group.title}</h3>
              <ul className="mt-6 divide-y divide-white/10">
                {group.items.map((item, i) => (
                  <li key={item} className="flex items-center justify-between gap-4 py-4">
                    <span className="text-base text-brand-white/85">{item}</span>
                    <span className="font-display text-sm text-brand-cyan">{String(i + 1).padStart(2, '0')}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
