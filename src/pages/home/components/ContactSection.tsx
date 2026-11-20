import { BRAND, BRAND_FULL, CONTACT, CONTACT_EMAIL, CONTACT_HREF, FOOTER } from '../content';

import MagneticLink from './MagneticLink';
import SectionLabel from './SectionLabel';
import SplitHeadline from './SplitHeadline';
import SectionBackdrop from './SectionBackdrop';

export default function ContactSection() {
  return (
    <section
      id="contact"
      
      className="relative flex min-h-screen flex-col justify-end overflow-hidden px-5 pb-10 pt-16 md:px-10"
    >
      <SectionBackdrop variant="contact" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[38rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,0,60,0.2),rgba(0,107,255,0.12)_60%,transparent)] blur-3xl" />

      <div data-section-rise className="relative mx-auto w-full max-w-7xl text-center">
        <div className="flex justify-center">
          <SectionLabel>{CONTACT.eyebrow}</SectionLabel>
        </div>
        <SplitHeadline
          text={CONTACT.headline}
          className="mx-auto max-w-5xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        />
        <p data-reveal className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-brand-white/75 md:text-lg">
          {CONTACT.text}
        </p>
        <a
          data-reveal
          href={CONTACT_HREF}
          className="mt-8 inline-block font-display text-2xl text-brand-cyan underline decoration-brand-cyan/30 underline-offset-8 transition hover:decoration-brand-cyan [text-shadow:0_0_20px_rgba(0,207,255,0.5)] md:text-4xl"
        >
          {CONTACT_EMAIL}
        </a>
        <div data-reveal data-delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticLink
            href={CONTACT_HREF}
            strength={0.5}
            className="btn-premium inline-block px-10 py-4 text-base font-semibold"
          >
            {CONTACT.cta}
          </MagneticLink>
          <MagneticLink
            href="#projects"
            className="btn-glass inline-block px-10 py-4 text-base font-semibold"
          >
            {CONTACT.secondary}
          </MagneticLink>
        </div>

        <footer className="mt-24 border-t border-white/10 pt-8 text-left">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <p className="font-display text-xl font-semibold">
                {BRAND_FULL}
                <span className="text-brand-red">.</span>
              </p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/65">
              {FOOTER.links.map((l) => (
                <a key={l.label} href={l.href} className="transition-colors hover:text-brand-white">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/65">
              {FOOTER.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-cyan"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 text-xs text-white/40 sm:flex-row sm:items-center">
            <span>
              © {new Date().getFullYear()} {BRAND} Solutions. All rights reserved.
            </span>
            <a href="#top" className="transition-colors hover:text-brand-white">
              {FOOTER.backToTop} ↑
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
