import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';

import SplitHeadline from '@/pages/home/components/SplitHeadline';
import type { Project } from '@/pages/home/content';

gsap.registerPlugin(ScrollTrigger);

interface ProjectHeroProps {
  project: Project;
  onImageReady: () => void;
}

/** Full-window picture with the project's name over it. The picture drifts and zooms as you scroll. */
export default function ProjectHero({ project, onImageReady }: ProjectHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.to(img, {
        yPercent: 14,
        scale: 1.16,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-hero-copy]', {
        y: -60,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom 30%', scrub: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <img
        ref={imgRef}
        src={project.image}
        alt={project.alt}
        onLoad={onImageReady}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/35 to-brand-bg/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/55 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full items-end px-5 pb-16 md:px-10 md:pb-20">
        <div data-hero-copy className="mx-auto w-full max-w-7xl">
          <div data-reveal data-delay={0.2} className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/25 bg-brand-bg/50 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-brand-cyan backdrop-blur-md">
              {project.subtitle}
            </span>
            <span className="text-sm text-white/60">{project.year}</span>
          </div>
          <SplitHeadline
            as="h1"
            text={project.title}
            delay={0.3}
            className="max-w-5xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl md:text-8xl"
          />
          <p data-reveal data-delay={0.7} className="mt-6 max-w-xl text-base text-brand-white/80 md:text-xl">
            {project.description}
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/45 md:flex">
        Scroll
        <span className="h-8 w-px animate-scroll-cue bg-gradient-to-b from-brand-red to-brand-blue motion-reduce:animate-none" />
      </div>
    </section>
  );
}
