import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { PROJECTS, projectPath } from '../content';
import { rememberHomeScroll } from '../nav-state';

interface Pic {
  image: string;
  alt: string;
}

/** A tile has two faces; `deg` grows by 180 on every flip, so the faces alternate. */
interface Tile {
  faces: [number, number];
  deg: number;
}

/** Tiles that flip (the featured tile does not). */
const FLIP_TILES = 5;
const FLIP_EVERY_MS = 1700;
const FLIP_MS = 900;

/**
 * A photo wall: one large featured tile (the lead project) beside smaller tiles that turn over,
 * one at a time, to show another picture. Pictures are the projects' own images and detail shots.
 */
export default function AboutPhotoWall() {
  const lead = PROJECTS[0];

  // Every picture we have, with the lead picture first (it lives on the featured tile).
  const pool = useMemo<Pic[]>(() => {
    const all: Pic[] = [];
    PROJECTS.forEach((p) => {
      all.push({ image: p.image, alt: p.alt });
      p.gallery.forEach((g) => all.push({ image: g.image, alt: g.alt }));
    });
    return all;
  }, []);

  // Start each flip tile on a different picture (skipping the lead).
  const [tiles, setTiles] = useState<Tile[]>(() =>
    Array.from({ length: FLIP_TILES }, (_, i) => ({ faces: [1 + i * 3, 2 + i * 3] as [number, number], deg: 0 })),
  );
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;
  const wallRef = useRef<HTMLDivElement>(null);
  const lastFlipped = useRef(-1);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let inView = false;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(wall);

    const timer = window.setInterval(() => {
      if (!inView || document.hidden) return;
      const cur = tilesRef.current;

      // Choose a tile other than the one that just flipped.
      let t = Math.floor(Math.random() * cur.length);
      if (t === lastFlipped.current) t = (t + 1) % cur.length;
      lastFlipped.current = t;

      // Pick a picture that is not already on screen (or the lead picture).
      const showing = new Set<number>([0]);
      cur.forEach((tile) => {
        showing.add(tile.faces[(tile.deg / 180) % 2 === 0 ? 0 : 1]);
      });
      const free = pool.map((_, i) => i).filter((i) => !showing.has(i));
      const next = free[Math.floor(Math.random() * free.length)];

      setTiles((prev) =>
        prev.map((tile, i) => {
          if (i !== t) return tile;
          const hidden = (tile.deg / 180) % 2 === 0 ? 1 : 0; // the face turned away right now
          const faces: [number, number] = [tile.faces[0], tile.faces[1]];
          faces[hidden] = next;
          return { faces, deg: tile.deg + 180 };
        }),
      );
    }, FLIP_EVERY_MS);

    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [pool]);

  return (
    <div ref={wallRef} data-reveal data-delay={0.2} className="grid grid-cols-3 gap-2.5 md:gap-3.5">
      {/* Featured tile: two columns wide, two rows tall */}
      <Link
        to={projectPath(lead.slug)}
        onClick={rememberHomeScroll}
        aria-label={`Open project: ${lead.title}`}
        data-wall-tile
        className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_90px_-30px_rgba(255,0,60,0.55)]"
      >
        <img
          src={lead.image}
          alt={lead.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/85 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 md:p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-brand-cyan">{lead.subtitle}</p>
          <p className="mt-1 font-display text-xl font-semibold md:text-3xl">{lead.title}</p>
        </div>
      </Link>

      {/* Tiles that turn over */}
      {tiles.map((tile, i) => (
        <div key={i} data-wall-tile className="aspect-square [perspective:900px]" aria-hidden="true">
          <div
            className="relative h-full w-full [transform-style:preserve-3d]"
            style={{ transform: `rotateY(${tile.deg}deg)`, transition: `transform ${FLIP_MS}ms cubic-bezier(0.22,1,0.36,1)` }}
          >
            {tile.faces.map((picIndex, face) => (
              <img
                key={face}
                src={pool[picIndex].image}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full rounded-2xl border border-white/15 object-cover [backface-visibility:hidden]"
                style={{ transform: face === 1 ? 'rotateY(180deg)' : undefined }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
