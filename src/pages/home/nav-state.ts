let homeScroll = 0;

/** Remember where the visitor was on the home page, so Back returns them to the same spot. */
export function rememberHomeScroll(): void {
  homeScroll = window.scrollY;
}

export function recalledHomeScroll(): number {
  return homeScroll;
}
