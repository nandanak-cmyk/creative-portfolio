import { Link } from 'react-router-dom';

import MagneticLink from '@/pages/home/components/MagneticLink';
import SplitHeadline from '@/pages/home/components/SplitHeadline';
import { BRAND, BRAND_FULL, CONTACT_EMAIL, CONTACT_HREF, PROJECT_PAGE } from '@/pages/home/content';

export default function ProjectCta() {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-10 md:px-10">
      <div
        data-float="-120"
        className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[56rem] max-w-full -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(var(--c),0.2), transparent)' }}
      />
      <div className="relative mx-auto max-w-7xl text-center">
        <SplitHeadline
          text={PROJECT_PAGE.ctaHeadline}
          className="mx-auto max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        />
        <p data-reveal className="mx-auto mt-6 max-w-xl text-base text-brand-white/75 md:text-lg">
          {PROJECT_PAGE.ctaText}
        </p>
        <div data-reveal data-delay={0.1} className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <MagneticLink href={CONTACT_HREF} strength={0.45} className="btn-premium inline-block px-10 py-4 text-base font-semibold">
            {PROJECT_PAGE.ctaButton}
          </MagneticLink>
          <Link to="/" className="btn-glass inline-block px-10 py-4 text-base font-semibold">
            {PROJECT_PAGE.back}
          </Link>
        </div>
        <p data-reveal className="mt-6 text-sm text-white/45">
          {CONTACT_EMAIL}
        </p>

        <footer className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} {BRAND} Solutions. All rights reserved.
          </span>
          <span>{BRAND_FULL}</span>
        </footer>
      </div>
    </section>
  );
}
