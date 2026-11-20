import gsap from 'gsap';
import { useEffect, useRef, type ElementType, type HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

/** Glass panel with 3D tilt and a neon border that follows the cursor. */
export default function GlassCard({ as: Tag = 'article', className = '', children, ...props }: GlassCardProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return undefined;

    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    gsap.set(el, { transformPerspective: 900 });

    const onMove = (ev: PointerEvent): void => {
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width;
      const py = (ev.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      rotY((px - 0.5) * 10);
      rotX(-(py - 0.5) * 10);
    };
    const onLeave = (): void => {
      rotX(0);
      rotY(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <Tag ref={ref} className={`glass-card ${className}`} {...props}>
      {children}
    </Tag>
  );
}
