import { useNavigate } from 'react-router-dom';

import ArcList from '@/shared/components/arc-list/ArcList';

import { PROJECTS, WORK, projectPath } from '../content';
import { rememberHomeScroll } from '../nav-state';

import SplitHeadline from './SplitHeadline';

/** Second hero screen: an arc-turning list of work beside a live image preview. */
export default function HeroWork() {
  const navigate = useNavigate();
  return (
    <div id="work" className="relative z-10 flex min-h-screen flex-col justify-center px-5 py-24 md:px-10">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/10 via-brand-bg/55 to-brand-bg" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl">
        <p
          data-reveal
          className="mb-4 text-xs uppercase tracking-[0.28em] text-brand-cyan [text-shadow:0_0_14px_rgba(0,207,255,0.7)]"
        >
          {WORK.eyebrow}
        </p>
        <SplitHeadline
          text={WORK.headline}
          className="max-w-3xl font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
        />
        <p data-reveal className="mt-4 max-w-xl text-base text-white/65">
          {WORK.sub}
        </p>
        <div data-reveal data-delay={0.15} className="mt-10 md:mt-12">
          <ArcList
            items={PROJECTS.map(({ title, subtitle, image, alt }) => ({ title, subtitle, image, alt }))}
            onSelect={(index) => {
              rememberHomeScroll();
              navigate(projectPath(PROJECTS[index].slug));
            }}
            ariaLabel="Selected work"
            imageSide="left"
            imageWidth={460}
            imageAspect={1.12}
            imageRadius={22}
            gap={72}
            spacing={84}
            curve={0.55}
            fontSize={40}
            interval={3.2}
            className="min-h-[380px] md:min-h-[440px]"
          />
        </div>
      </div>
    </div>
  );
}
