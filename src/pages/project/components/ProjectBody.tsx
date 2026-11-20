import GlassCard from '@/pages/home/components/GlassCard';
import ScrubText from '@/pages/home/components/ScrubText';
import SectionLabel from '@/pages/home/components/SectionLabel';
import SplitHeadline from '@/pages/home/components/SplitHeadline';
import Tag from '@/pages/home/components/Tag';
import { PROJECT_PAGE, type Project } from '@/pages/home/content';

/** "A, B and C" */
const joinList = (items: readonly string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

interface ProjectBodyProps {
  project: Project;
}

export default function ProjectBody({ project }: ProjectBodyProps) {
  const overview = `${project.description} ${PROJECT_PAGE.studio} delivered it in ${project.year} as ${project.categories.toLowerCase()} work, covering ${joinList(project.tags.map((t) => t.toLowerCase()))}.`;

  const facts: Array<[string, string]> = [
    ['Category', project.categories],
    ['Year', project.year],
    ['Studio', PROJECT_PAGE.studio],
    ['Deliverables', `${project.tags.length}`],
  ];

  return (
    <>
      <section className="relative px-5 py-24 md:px-10 md:py-36">
        <div
          data-float="-150"
          className="pointer-events-none absolute -right-20 top-10 h-[30rem] w-[30rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(var(--c),0.22), transparent)' }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 md:grid-cols-[1.35fr_1fr] md:gap-20">
          <div>
            <SectionLabel>{PROJECT_PAGE.overview}</SectionLabel>
            <ScrubText text={overview} className="text-2xl leading-snug text-brand-white md:text-4xl md:leading-snug" />
          </div>

          <div className="space-y-5">
            <GlassCard as="div" data-reveal className="p-7">
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-brand-cyan">{PROJECT_PAGE.details}</h2>
              <dl className="mt-5 divide-y divide-white/10">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-6 py-3.5">
                    <dt className="text-sm text-white/50">{label}</dt>
                    <dd className="text-right font-display text-lg">{value}</dd>
                  </div>
                ))}
              </dl>
            </GlassCard>

            <GlassCard as="div" data-reveal data-delay={0.1} className="p-7">
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-brand-cyan">{PROJECT_PAGE.scope}</h2>
              <ol className="mt-5 space-y-4">
                {project.tags.map((tag, i) => (
                  <li key={tag} className="flex items-center gap-4">
                    <span className="neon-liquid font-display text-2xl font-semibold">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-base text-brand-white/85">{tag}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-24 md:px-10 md:pb-36">
        <div className="mx-auto max-w-7xl">
          <div
            data-scrub-card
            className="overflow-hidden rounded-3xl border border-white/10"
            style={{ boxShadow: '0 50px 140px -40px rgba(var(--c),0.55)' }}
          >
            <img src={project.image} alt={project.alt} loading="lazy" decoding="async" className="h-auto w-full" />
          </div>
          <p data-reveal className="mt-4 text-sm text-white/45">
            {project.title} — {project.subtitle}, {project.year}
          </p>

          <div className="mt-24">
            <SplitHeadline
              text="Look *closer.*"
              className="mb-10 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            />
            <p data-reveal className="sr-only">
              {PROJECT_PAGE.gallery}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {project.gallery.map((image, i) => (
                <figure key={image.image} data-reveal data-delay={i * 0.1} className="group overflow-hidden rounded-3xl border border-white/10">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.image}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between px-5 py-4 text-xs uppercase tracking-[0.2em] text-white/50">
                    <span>Detail {String(i + 1).padStart(2, '0')}</span>
                    <span className="text-brand-cyan">{String(i + 1).padStart(2, '0')} / {String(project.gallery.length).padStart(2, '0')}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
