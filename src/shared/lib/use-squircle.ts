'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { getSvgPath } from 'figma-squircle';

type SquircleResult<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  style: CSSProperties;
  path?: string;
  width?: number;
  height?: number;
};

export function useSquircle<T extends HTMLElement>(
  cornerRadius: number,
  cornerSmoothing = 0.8,
): SquircleResult<T> {
  const ref = useRef<T>(null);
  const [state, setState] = useState<{
    clip: string;
    path?: string;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w < 1 || h < 1) return;

      const path = getSvgPath({ width: w, height: h, cornerRadius, cornerSmoothing });
      const clip = `path('${path}')`;

      setState({ clip, path, w, h });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [cornerRadius, cornerSmoothing]);

  const style: CSSProperties = state ? { clipPath: state.clip } : {};

  return {
    ref,
    style,
    path: state?.path,
    width: state?.w,
    height: state?.h,
  };
}
