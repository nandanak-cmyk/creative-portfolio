import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import CursorGlow from './components/CursorGlow';
import ExpertiseSection from './components/ExpertiseSection';
import HeroSection from './components/HeroSection';
import InfiniteGallerySection from './components/InfiniteGallerySection';
import IntroLoader from './components/IntroLoader';
import Navbar from './components/Navbar';
import ProcessSection from './components/ProcessSection';
import ScrollProgress from './components/ScrollProgress';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import WorksSection from './components/WorksSection';
import { useSmoothScroll } from './hooks/use-smooth-scroll';
import { recalledHomeScroll } from './nav-state';
import { useReveal } from './use-reveal';

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navType = useNavigationType();
  useSmoothScroll();
  useReveal(rootRef);

  // Returning with Back puts the visitor exactly where they left (the cards); any other arrival starts at the top.
  useLayoutEffect(() => {
    const saved = recalledHomeScroll();
    if (navType === 'POP' && saved > 0) {
      window.scrollTo(0, saved);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-x-clip bg-brand-bg">
      <IntroLoader />
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main id="main">
        <HeroSection />
        <InfiniteGallerySection />
        <AboutSection />
        <WorksSection />
        <ServicesSection />
        <ProcessSection />
        <ExpertiseSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
    </div>
  );
}
