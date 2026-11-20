import gsap from 'gsap';

let pending: HTMLElement | null = null;

interface OpenOptions {
  /** On-screen rectangle of the card that was chosen. */
  rect: DOMRect;
  image: string;
  /** Card colour as "r,g,b". */
  color: string;
  /** Called once the picture has grown to fill the window: navigate here. */
  go: () => void;
}

/**
 * Shared-element transition: the chosen card's picture grows from the card to fill the whole
 * window, then the page changes underneath it. The project page calls `finishProjectTransition`
 * to fade the overlay away, revealing the same picture already in place.
 */
export function openProjectFromCard({ rect, image, color, go }: OpenOptions): void {
  if (pending) return; // already opening
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '90',
    overflow: 'hidden',
    borderRadius: '28px',
    backgroundImage: `url("${image}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: `0 0 140px rgba(${color},0.75)`,
    willChange: 'left, top, width, height',
  });
  const shade = document.createElement('div');
  Object.assign(shade.style, {
    position: 'absolute',
    inset: '0',
    background: 'linear-gradient(to top, rgba(3,3,5,0.85), rgba(3,3,5,0.15) 55%, rgba(3,3,5,0.35))',
  });
  overlay.appendChild(shade);
  document.body.appendChild(overlay);
  pending = overlay;

  gsap.to(overlay, {
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    duration: 0.9,
    ease: 'expo.inOut',
    onComplete: go,
  });
}

/** Fade the transition overlay away (called by the project page once its picture is ready). */
export function finishProjectTransition(): void {
  const overlay = pending;
  if (!overlay) return;
  pending = null;
  gsap.to(overlay, {
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    onComplete: () => overlay.remove(),
  });
}
