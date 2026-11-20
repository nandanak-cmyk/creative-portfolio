let release: () => void = () => undefined;
let played = false;

/**
 * Resolves when the opening sequence hands over to the page. Page animations
 * (hero logo, text reveals) wait on this so they play as the curtain opens.
 */
export const introReady: Promise<void> = new Promise<void>((resolve) => {
  release = resolve;
});

export function releaseIntro(): void {
  played = true;
  release();
}

/** True once the opening has played in this page load (so coming back to the home page skips it). */
export function introPlayed(): boolean {
  return played;
}
