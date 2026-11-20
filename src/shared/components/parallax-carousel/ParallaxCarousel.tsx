import gsap from 'gsap';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface ParallaxCarouselHandle {
  scrollToIndex: (index: number) => void;
  reset: () => void;
}

export interface ParallaxCarouselProps {
  images: string[];
  /** Optional label per image (shown bottom-left). */
  captions?: string[];
  imageWidth?: number;
  imageHeight?: number;
  gap?: number;
  /** Horizontal counter-shift of the picture inside its frame (0-1). */
  parallaxIntensity?: number;
  /** Inner picture inset giving the parallax room (0.6-1). */
  uvScale?: number;
  /** Scroll smoothing factor (0-1). */
  lerp?: number;
  wheelSensitivity?: number;
  dragSensitivity?: number;
  loop?: boolean;
  borderRadius?: number;
  /** Idle drift in CSS px per second. */
  autoplaySpeed?: number;
  pauseOnHover?: boolean;
  showProgress?: boolean;
  className?: string;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const mod = (a: number, n: number): number => ((a % n) + n) % n;

const ParallaxCarousel = forwardRef<ParallaxCarouselHandle, ParallaxCarouselProps>(function ParallaxCarousel(
  {
    images,
    captions,
    imageWidth = 420,
    imageHeight = 560,
    gap = 32,
    parallaxIntensity = 0.4,
    uvScale = 0.85,
    lerp = 0.08,
    wheelSensitivity = 1,
    dragSensitivity = 1.4,
    loop = false,
    borderRadius = 16,
    autoplaySpeed = 0,
    pauseOnHover = true,
    showProgress = true,
    className = '',
  },
  ref,
) {
  const n = images.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1200);
  const s = useRef({ cur: 0, target: 0, dragging: false, hover: false, inView: true, lastX: 0, reduced: false });

  // Responsive frame: never wider than 72% of the container.
  const w = Math.min(imageWidth, vw * 0.72);
  const h = imageHeight * (w / imageWidth);
  const step = w + gap;
  const total = n * step;
  const max = Math.max(0, (n - 1) * step);
  const room = (w / uvScale - w) / 2;

  const render = useCallback((): void => {
    const cur = s.current.cur;
    for (let i = 0; i < n; i++) {
      const plane = planeRefs.current[i];
      const img = imgRefs.current[i];
      if (!plane || !img) continue;
      let d = i * step - cur;
      if (loop) d = mod(d + total / 2, total) - total / 2;
      const far = Math.abs(d) > vw / 2 + w;
      plane.style.visibility = far ? 'hidden' : 'visible';
      if (far) continue;
      const t = Math.min(Math.abs(d) / (vw / 2), 1);
      plane.style.transform = `translate3d(${d}px,0,0) rotateY(${(-d / vw) * 14}deg) scale(${1 - 0.1 * t})`;
      plane.style.opacity = String(1 - 0.45 * t);
      plane.style.zIndex = String(1000 - Math.round(Math.abs(d)));
      const shift = clamp(-(d / (vw / 2)) * parallaxIntensity * room * 2, -room, room);
      img.style.transform = `translate3d(${shift}px,0,0)`;
    }
    if (barRef.current) barRef.current.style.transform = `scaleX(${max ? clamp(cur / max, 0, 1) : 0})`;
  }, [n, step, total, loop, vw, w, parallaxIntensity, room, max]);

  // Animation loop.
  useEffect(() => {
    s.current.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = (_time: number, deltaMs: number): void => {
      const st = s.current;
      if (!st.inView && !st.dragging) return;
      const dt = Math.min(deltaMs / 1000, 0.05);
      if (autoplaySpeed && !st.reduced && !st.dragging && !(pauseOnHover && st.hover)) st.target += autoplaySpeed * dt;
      if (!loop) st.target = clamp(st.target, 0, max);
      st.cur += (st.target - st.cur) * (st.reduced ? 1 : 1 - Math.pow(1 - lerp, dt * 60));
      render();
    };
    gsap.ticker.add(tick);
    render();
    return () => gsap.ticker.remove(tick);
  }, [render, autoplaySpeed, pauseOnHover, loop, max, lerp]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ro = new ResizeObserver(([entry]) => setVw(entry.contentRect.width));
    const io = new IntersectionObserver(([entry]) => {
      s.current.inView = entry.isIntersecting;
    });
    ro.observe(root);
    io.observe(root);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Horizontal wheel / trackpad swipes drive the carousel; vertical wheel still scrolls the page.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const onWheel = (ev: WheelEvent): void => {
      const horizontal = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) || ev.shiftKey;
      if (!horizontal) return;
      ev.preventDefault();
      s.current.target += (ev.deltaX || ev.deltaY) * wheelSensitivity;
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, [wheelSensitivity]);

  const goTo = useCallback(
    (index: number): void => {
      const st = s.current;
      const dest = clamp(index, 0, n - 1) * step;
      if (loop) {
        const base = Math.round(st.target / step) * step;
        st.target = base + mod(index * step - base + total / 2, total) - total / 2;
      } else {
        st.target = dest;
      }
    },
    [loop, n, step, total],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: goTo,
      reset: () => {
        s.current.target = 0;
        s.current.cur = 0;
        render();
      },
    }),
    [goTo, render],
  );

  const moveCursor = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  useEffect(() => {
    const el = cursorRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return undefined;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.6 });
    moveCursor.current = {
      x: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' }),
    };
    return () => {
      gsap.killTweensOf(el);
    };
  }, []);

  const onPointerDown = (ev: React.PointerEvent): void => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    s.current.dragging = true;
    s.current.lastX = ev.clientX;
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    if (cursorRef.current) gsap.to(cursorRef.current, { scale: 0.85, duration: 0.25 });
  };
  const onPointerMove = (ev: React.PointerEvent): void => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect && moveCursor.current) {
      moveCursor.current.x(ev.clientX - rect.left);
      moveCursor.current.y(ev.clientY - rect.top);
    }
    const st = s.current;
    if (!st.dragging) return;
    st.target -= (ev.clientX - st.lastX) * dragSensitivity;
    st.lastX = ev.clientX;
  };
  const onPointerUp = (): void => {
    s.current.dragging = false;
    if (cursorRef.current) gsap.to(cursorRef.current, { scale: 1, duration: 0.25 });
  };

  const onKeyDown = (ev: React.KeyboardEvent): void => {
    if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
    ev.preventDefault();
    goTo(Math.round(s.current.target / step) + (ev.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Image gallery"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => {
        s.current.hover = true;
        if (cursorRef.current) gsap.to(cursorRef.current, { autoAlpha: 1, scale: 1, duration: 0.3 });
      }}
      onPointerLeave={() => {
        s.current.hover = false;
        if (cursorRef.current) gsap.to(cursorRef.current, { autoAlpha: 0, scale: 0.6, duration: 0.3 });
      }}
      className={`relative w-full cursor-grab touch-pan-y select-none overflow-hidden outline-none active:cursor-grabbing ${className}`}
      style={{ height: h + 56, perspective: 1400 }}
    >
      {images.map((src, i) => (
        <div
          key={src}
          ref={(el) => {
            planeRefs.current[i] = el;
          }}
          className="absolute left-1/2 top-4 overflow-hidden border border-white/15 shadow-[0_30px_90px_-30px_rgba(255,0,60,0.55),0_0_60px_-30px_rgba(0,107,255,0.6)] will-change-transform"
          style={{ width: w, height: h, marginLeft: -w / 2, borderRadius }}
        >
          <img
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={src}
            alt={captions?.[i] ?? ''}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="absolute top-0 h-full max-w-none object-cover will-change-transform"
            style={{ width: w / uvScale, left: -(w / uvScale - w) / 2 }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/85 via-transparent to-transparent" />
          {captions?.[i] ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-xs uppercase tracking-[0.22em]">
              <span className="font-display text-base normal-case tracking-tight text-brand-white">{captions[i]}</span>
              <span className="text-brand-cyan [text-shadow:0_0_12px_rgba(0,207,255,0.8)]">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          ) : null}
        </div>
      ))}

      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[2000] hidden h-20 w-20 items-center [@media(pointer:fine)]:flex justify-center rounded-full border border-white/30 bg-brand-bg/50 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-white shadow-[0_0_40px_-6px_#FF003C] backdrop-blur-md"
      >
        Drag
      </div>

      {showProgress && !loop ? (
        <div className="absolute inset-x-8 bottom-2 h-px bg-white/10">
          <span
            ref={barRef}
            className="block h-full origin-left bg-gradient-to-r from-brand-red via-brand-blue to-brand-cyan shadow-[0_0_12px_#FF003C]"
          />
        </div>
      ) : null}
    </div>
  );
});

export default ParallaxCarousel;
