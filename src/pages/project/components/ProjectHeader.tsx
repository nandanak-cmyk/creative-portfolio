import { Link, useNavigate } from 'react-router-dom';

import MagneticLink from '@/pages/home/components/MagneticLink';
import { BRAND, CONTACT_HREF, PROJECT_PAGE } from '@/pages/home/content';

/** Slim fixed header: a back button, the brand, and a way to get in touch. */
export default function ProjectHeader() {
  const navigate = useNavigate();

  // If there is history inside the app, go back to where the visitor was; otherwise go to the home page.
  const goBack = (): void => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-brand-bg/90 via-brand-bg/55 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]">
      <nav aria-label="Project" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10 md:py-6">
        <button
          type="button"
          onClick={goBack}
          className="btn-glass inline-flex items-center gap-2 px-5 py-2 text-sm font-medium"
        >
          <span aria-hidden="true">←</span>
          {PROJECT_PAGE.back}
        </button>
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          {BRAND}
          <span className="text-brand-red">.</span>
        </Link>
        <MagneticLink href={CONTACT_HREF} className="btn-glass hidden px-5 py-2 text-sm font-medium sm:inline-block">
          Let&apos;s talk
        </MagneticLink>
      </nav>
    </header>
  );
}
