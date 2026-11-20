import { FastAverageColor } from 'fast-average-color';
import { useEffect, useState } from 'react';

import { DEFAULT_MOOD, vividColor } from '@/pages/home/color';

/** The picture's dominant colour as a vivid "r,g,b", used to tint the page's glows. */
export function useProjectColor(image: string): string {
  const [color, setColor] = useState(DEFAULT_MOOD);

  useEffect(() => {
    let cancelled = false;
    const fac = new FastAverageColor();
    fac
      .getColorAsync(image, {
        algorithm: 'dominant',
        ignoredColor: [
          [0, 0, 0, 255, 70],
          [255, 255, 255, 255, 40],
        ],
      })
      .then((result) => {
        if (!cancelled) setColor(vividColor(result.value));
      })
      .catch(() => undefined)
      .finally(() => fac.destroy());
    return () => {
      cancelled = true;
    };
  }, [image]);

  return color;
}
