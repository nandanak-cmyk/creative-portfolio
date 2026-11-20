import { Link } from 'react-router-dom';

import { PROJECT_PAGE, PROJECTS, projectPath, type Project } from '@/pages/home/content';

interface NextProjectProps {
  current: Project;
}

/** Big link to the next project, so visitors can keep exploring. */
export default function NextProject({ current }: NextProjectProps) {
  const index = PROJECTS.findIndex((p) => p.slug === current.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <section className="px-5 pb-24 md:px-10 md:pb-32">
      <Link
        to={projectPath(next.slug)}
        data-reveal
        className="group relative mx-auto block h-[46vh] min-h-[320px] max-w-7xl overflow-hidden rounded-3xl border border-white/10"
      >
        <img
          src={next.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-[1600ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/45 to-brand-bg/30" />
        <div className="relative z-10 flex h-full flex-col justify-between p-7 md:p-12">
          <span className="text-[11px] uppercase tracking-[0.28em] text-brand-cyan">{PROJECT_PAGE.next}</span>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">{next.subtitle}</p>
              <p className="neon-chrome mt-2 font-display text-4xl font-semibold leading-tight md:text-7xl">{next.title}</p>
            </div>
            <span
              aria-hidden="true"
              className="mb-2 hidden h-16 w-16 items-center justify-center rounded-full border border-white/30 text-2xl backdrop-blur-md transition duration-500 group-hover:translate-x-2 group-hover:border-brand-red/70 md:flex"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
