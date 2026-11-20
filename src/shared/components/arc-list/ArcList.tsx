import gsap from 'gsap';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { placeOnArc } from './arc-math';

export interface ArcListItem {
  title: string;
  image?: string;
  alt?: string;
  subtitle?: string;
  href?: string;
}

export interface ArcListHandle {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

export interface ArcListProps {
  items: ArcListItem[];
  startIndex?: number;
  orientation?: 'auto' | 'vertical' | 'horizontal';
  imageSide?: 'left' | 'right' | 'none';
  curve?: number;
  spacing?: number;
  visible?: number;
  fade?: number;
  shrink?: number;
  blur?: number;
  fontSize?: number;
  autoplay?: boolean;
  /** Seconds between automatic steps. */
  interval?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  /** Mouse wheel steps through the list (captures page scroll while hovering). */
  wheel?: boolean;
  draggable?: boolean;
  imageWidth?: number;
  /** width / height of the preview frame. */
  imageAspect?: number;
  imageRadius?: number;
  gap?: number;
  imageBlur?: number;
  ariaLabel?: string;
  onChange?: (index: number, item: ArcListItem) => void;
  onSelect?: (index: number, item: ArcListItem) => void;
  className?: string;
}

const mod = (a: number, n: number): number => ((a % n) + n) % n;

const ArcList = forwardRef<ArcListHandle, ArcListProps>(function ArcList(
  {
    items,
    startIndex = 0,
    orientation = 'auto',
    imageSide = 'left',
    curve = 0.5,
    spacing = 76,
    visible = 3,
    fade = 0.35,
    shrink = 0.1,
    blur = 0,
    fontSize = 30,
    autoplay = true,
    interval = 3.5,
    pauseOnHover = true,
    loop = true,
    wheel = false,
    draggable = true,
    imageWidth = 340,
    imageAspect = 0.78,
    imageRadius = 14,
    gap = 64,
    imageBlur = 18,
    ariaLabel = 'Projects',
    onChange,
    onSelect,
    className = '',
  },
  ref,
) {
  const n = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pos = useRef({ v: startIndex });
  const tween = useRef<gsap.core.Tween | null>(null);
  const paused = useRef(false);
  const inView = useRef(true);
  const dragged = useRef(false);
  const reduced = useRef(false);
  const [active, setActive] = useState(startIndex);
  const [narrow, setNarrow] = useState(false);

  const horizontal = orientation === 'horizontal' || (orientation === 'auto' && narrow);
  const side = horizontal ? 'none' : imageSide;
  /** Distance between titles along the arc axis. Measured when called (never during render). */
  const getSlot = useCallback((): number => {
    const width = stageRef.current?.clientWidth ?? 0;
    const slotSize = horizontal && width > 0 ? Math.min(spacing * 2.6, width * 0.5) : spacing;
    return Math.max(slotSize, 1);
  }, [horizontal, spacing]);

  const layout = useCallback((): void => {
    const v = pos.current.v;
    const slot = getSlot();
    items.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      let d = i - v;
      if (loop) {
        d = mod(d, n);
        if (d > n / 2) d -= n;
      }
      const p = placeOnArc(d, { spacing: slot, curve, visible, fade, shrink, blur, horizontal, side });
      el.style.transform = horizontal
        ? `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${p.scale})`
        : `translate3d(${p.x}px, ${p.y}px, 0) translateY(-50%) scale(${p.scale})`;
      el.style.opacity = String(p.opacity);
      el.style.filter = p.blur > 0.1 ? `blur(${p.blur}px)` : 'none';
      el.style.pointerEvents = p.opacity < 0.08 ? 'none' : 'auto';
      el.dataset.active = String(Math.abs(d) < 0.5);
    });
    const idx = mod(Math.round(v), n);
    setActive((prev) => (prev === idx ? prev : idx));
  }, [items, n, loop, getSlot, curve, visible, fade, shrink, blur, horizontal, side]);

  const animateTo = useCallback(
    (dest: number): void => {
      const target = loop ? dest : Math.min(n - 1, Math.max(0, dest));
      tween.current?.kill();
      if (reduced.current) {
        pos.current.v = target;
        layout();
        return;
      }
      tween.current = gsap.to(pos.current, { v: target, duration: 0.9, ease: 'power3.out', onUpdate: layout });
    },
    [layout, loop, n],
  );

  const goTo = useCallback(
    (index: number): void => {
      const cur = pos.current.v;
      let d = mod(index - Math.round(cur), n);
      if (d > n / 2) d -= n;
      animateTo(Math.round(cur) + (loop ? d : index - Math.round(cur)));
    },
    [animateTo, loop, n],
  );
  const next = useCallback((): void => animateTo(Math.round(pos.current.v) + 1), [animateTo]);
  const previous = useCallback((): void => animateTo(Math.round(pos.current.v) - 1), [animateTo]);

  useImperativeHandle(ref, () => ({ next, previous, goTo }), [next, previous, goTo]);

  // Initial + responsive layout.
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    layout();
  }, [layout]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < 640);
      layout();
    });
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
    });
    ro.observe(root);
    io.observe(root);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [layout]);

  // Autoplay.
  useEffect(() => {
    if (!autoplay || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let call: gsap.core.Tween;
    const tick = (): void => {
      if (!paused.current && inView.current && !document.hidden) next();
      call = gsap.delayedCall(interval, tick);
    };
    call = gsap.delayedCall(interval, tick);
    return () => {
      call.kill();
    };
  }, [autoplay, interval, n, next]);

  useEffect(() => () => void tween.current?.kill(), []);

  useEffect(() => {
    onChange?.(active, items[active]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Optional wheel stepping.
  useEffect(() => {
    const stage = stageRef.current;
    if (!wheel || !stage) return undefined;
    let last = 0;
    const onWheel = (ev: WheelEvent): void => {
      ev.preventDefault();
      const now = performance.now();
      if (Math.abs(ev.deltaY) < 20 || now - last < 450) return;
      last = now;
      if (ev.deltaY > 0) next();
      else previous();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [wheel, next, previous]);

  const select = (i: number): void => {
    if (dragged.current) return;
    if (i !== active) {
      goTo(i);
      return;
    }
    onSelect?.(i, items[i]);
    if (items[i].href) window.location.assign(items[i].href as string);
  };

  // Drag along the arc's main axis.
  const dragStart = useRef<{ p: number; v: number } | null>(null);
  const onPointerDown = (ev: React.PointerEvent): void => {
    if (!draggable || ev.pointerType === 'mouse' && ev.button !== 0) return;
    tween.current?.kill();
    dragged.current = false;
    dragStart.current = { p: horizontal ? ev.clientX : ev.clientY, v: pos.current.v };
  };
  const onPointerMove = (ev: React.PointerEvent): void => {
    const s = dragStart.current;
    if (!s) return;
    const delta = (horizontal ? ev.clientX : ev.clientY) - s.p;
    if (Math.abs(delta) > 6) {
      dragged.current = true;
      (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    }
    if (dragged.current) {
      pos.current.v = s.v - delta / getSlot();
      layout();
    }
  };
  const onPointerUp = (): void => {
    if (!dragStart.current) return;
    dragStart.current = null;
    if (dragged.current) {
      animateTo(Math.round(pos.current.v));
      window.setTimeout(() => {
        dragged.current = false;
      }, 0);
    }
  };

  const onKeyDown = (ev: React.KeyboardEvent): void => {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
      ev.preventDefault();
      next();
    } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
      ev.preventDefault();
      previous();
    } else if (ev.key === 'Enter' && document.activeElement === rootRef.current) {
      select(active);
    }
  };

  const right = side === 'right';
  const frame = (
    <div
      className="relative shrink-0 overflow-hidden border border-white/15 shadow-[0_0_90px_-22px_rgba(255,0,60,0.6),0_0_70px_-26px_rgba(0,107,255,0.65)]"
      style={{
        width: horizontal ? `min(100%, ${imageWidth}px)` : imageWidth,
        aspectRatio: String(imageAspect),
        borderRadius: imageRadius,
      }}
    >
      {items.map((it, i) =>
        it.image ? (
          <img
            key={it.title}
            src={it.image}
            alt={it.alt ?? it.title}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,filter,transform] duration-700 ease-out"
            style={{
              opacity: i === active ? 1 : 0,
              filter: i === active ? 'blur(0px)' : `blur(${imageBlur}px)`,
              transform: i === active ? 'scale(1)' : 'scale(1.08)',
            }}
          />
        ) : null,
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-[11px] uppercase tracking-[0.25em]">
        <span className="text-brand-cyan [text-shadow:0_0_12px_rgba(0,207,255,0.8)]">
          {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
        <span className="text-white/60">{items[active]?.subtitle}</span>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerEnter={() => {
        if (pauseOnHover) paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
      className={`flex w-full min-h-[360px] select-none outline-none ${
        horizontal ? 'flex-col items-center' : right ? 'flex-row-reverse items-center' : 'flex-row items-center'
      } ${className}`}
      style={{ gap }}
    >
      {side !== 'none' || horizontal ? frame : null}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative min-w-0 ${horizontal ? 'h-40 w-full touch-pan-y' : 'h-full min-h-[360px] flex-1 touch-pan-x self-stretch'}`}
      >
        {items.map((it, i) => (
          <button
            key={it.title}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            aria-current={i === active}
            onClick={() => select(i)}
            data-active="false"
            className={`group absolute whitespace-nowrap font-display font-semibold leading-none tracking-tight text-white/40 outline-none will-change-transform ${
              horizontal ? 'left-1/2 top-4 origin-center text-center' : right ? 'right-0 top-1/2 origin-right text-right' : 'left-0 top-1/2 origin-left text-left'
            }`}
            style={{ fontSize: horizontal ? Math.min(fontSize, 26) : fontSize }}
          >
            <span className="block transition-colors duration-300 group-hover:text-white/80 group-data-[active=true]:neon-liquid group-data-[active=true]:text-transparent">
              {it.title}
            </span>
            {it.subtitle ? (
              <span className="mt-2 block text-[11px] font-medium uppercase tracking-[0.25em] text-brand-cyan opacity-0 transition-opacity duration-500 group-data-[active=true]:opacity-100">
                {it.subtitle}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
});

export default ArcList;
