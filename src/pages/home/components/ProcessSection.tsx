import { PROCESS } from '../content';

import GlassCard from './GlassCard';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import SectionBackdrop from './SectionBackdrop';

export default function ProcessSection() {
  return (
    <section id="process"  className="relative px-5 py-28 md:px-10 md:py-40">
      <SectionBackdrop variant="process" />
      <div data-float="-160" className="pointer-events-none absolute right-0 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(0,207,255,0.1),transparent)] blur-2xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="md:w-[52%]">
          <SectionLabel>{PROCESS.eyebrow}</SectionLabel>
          <SplitHeadline
            text={PROCESS.headline}
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          />
          <div className="relative mt-14 pl-8">
            <span className="absolute bottom-2 left-0 top-2 w-px bg-white/10">
              <span
                data-scrub-line
                className="block h-full origin-top bg-gradient-to-b from-brand-red via-brand-blue to-brand-cyan shadow-[0_0_14px_#FF003C]"
              />
            </span>
            <ol className="space-y-3">
              {PROCESS.steps.map((step, i) => (
                <GlassCard as="li" key={step.index} data-reveal data-delay={i * 0.05} className="flex gap-6 p-6">
                  <span className="neon-liquid font-display text-3xl font-semibold">{step.index}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-white/70">{step.text}</p>
                  </div>
                </GlassCard>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
