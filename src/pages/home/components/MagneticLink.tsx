import gsap from 'gsap';
import { useEffect, useRef, type AnchorHTMLAttributes } from 'react';

interface MagneticLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** How far (0..1) the element chases the cursor. */
  strength?: number;
}

/** Link that is pulled towards the cursor and springs back on leave. */
export default function MagneticLink({ strength = 0.35, children, ...props }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return undefined;

    const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const onMove = (ev: PointerEvent): void => {
      const r = el.getBoundingClientRect();
      moveX((ev.clientX - (r.left + r.width / 2)) * strength);
      moveY((ev.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = (): void => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <a ref={ref} {...props}>
      {children}
    </a>
  );
}
