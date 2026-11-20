import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import CursorGlow from '@/pages/home/components/CursorGlow';
import ScrollProgress from '@/pages/home/components/ScrollProgress';
import { findProject, type Project } from '@/pages/home/content';
import { useSmoothScroll } from '@/pages/home/hooks/use-smooth-scroll';
import { finishProjectTransition } from '@/pages/home/open-project';
import { useReveal } from '@/pages/home/use-reveal';

import NextProject from './components/NextProject';
import ProjectBody from './components/ProjectBody';
import ProjectCta from './components/ProjectCta';
import ProjectHeader from './components/ProjectHeader';
import ProjectHero from './components/ProjectHero';
import { useProjectColor } from './hooks/use-project-color';

/** Route: /work/:slug. Unknown slugs go back to the home page. */
export default function ProjectPage() {
  const { slug } = useParams();
  const project = findProject(slug);
  if (!project) return <Navigate to="/" replace />;
  // `key` remounts the page when moving between projects, so every animation restarts cleanly.
  return <ProjectView key={project.slug} project={project} />;
}

function ProjectView({ project }: { project: Project }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useSmoothScroll();
  useReveal(rootRef);
  const color = useProjectColor(project.image);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    // The picture is already in place under the transition overlay; fade it away even if load events are slow.
    const t = window.setTimeout(finishProjectTransition, 1200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen overflow-x-clip bg-brand-bg"
      style={{ '--c': color } as CSSProperties}
    >
      <ScrollProgress />
      <CursorGlow />
      <ProjectHeader />
      <main>
        <ProjectHero project={project} onImageReady={finishProjectTransition} />
        <ProjectBody project={project} />
        <NextProject current={project} />
        <ProjectCta />
      </main>
    </div>
  );
}
