import { useEffect, useState } from 'react';

import { BRAND, BRAND_TAGLINE, CONTACT_EMAIL, NAV_LINKS } from '../content';

import MagneticLink from './MagneticLink';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock page scroll and allow Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-brand-red px-5 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-brand-bg/90 via-brand-bg/60 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]">
        <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10 md:py-6">
          <a href="#top" className="flex items-baseline gap-2 font-display text-xl font-semibold tracking-tight">
            <span>
              {BRAND}
              <span className="text-brand-red">.</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.25em] text-white/45 sm:inline">
              {BRAND_TAGLINE}
            </span>
          </a>

          <ul className="hidden items-center gap-10 text-sm text-brand-white/70 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-brand-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <MagneticLink
              href="#contact"
              className="hidden rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium backdrop-blur-md transition-colors hover:border-brand-red/70 hover:bg-brand-red/15 hover:shadow-[0_0_30px_-6px_#FF003C] sm:inline-block"
            >
              Let&apos;s talk
            </MagneticLink>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium backdrop-blur-md md:hidden"
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        // `flex` would override the `hidden` attribute, so visibility is controlled by the class itself.
        aria-hidden={!open}
        className={`fixed inset-0 z-20 flex-col justify-center bg-brand-bg/95 px-8 backdrop-blur-xl md:!hidden ${
          open ? 'flex' : 'hidden'
        }`}
      >
        <ul className="space-y-6">
          {[...NAV_LINKS, { label: "Let's talk", href: '#contact' }].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="neon-chrome font-display text-5xl font-semibold tracking-tight"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={`mailto:${CONTACT_EMAIL}`} className="mt-12 text-sm text-brand-cyan">
          {CONTACT_EMAIL}
        </a>
      </div>
    </>
  );
}
