'use client';

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  createElement,
  type ReactNode,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
} from 'react';
import { getSvgPath } from 'figma-squircle';

type SquircleOwnProps = {
  as?: ElementType;
  cornerRadius: number;
  cornerSmoothing?: number;
  borderWidth?: number;
  borderColor?: string;
  children?: ReactNode;
};

export type SquircleProps = SquircleOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof SquircleOwnProps>;

export const Squircle = forwardRef<HTMLElement, SquircleProps>(
  (
    {
      as: Tag = 'div',
      cornerRadius,
      cornerSmoothing = 0.8,
      borderWidth,
      borderColor,
      className,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const localRef = useRef<HTMLElement>(null);
    const [sq, setSq] = useState<{
      clip: string;
      borderD?: string;
      w: number;
      h: number;
    } | null>(null);

    useEffect(() => {
      const el = localRef.current;
      if (!el) return;

      const update = () => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (w < 1 || h < 1) return;

        const clipD = getSvgPath({ width: w, height: h, cornerRadius, cornerSmoothing });
        const clip = `path('${clipD}')`;

        let borderD: string | undefined;
        if (borderWidth && borderWidth > 0) {
          const bw = borderWidth;
          const insetR = Math.max(0, cornerRadius - bw / 2);
          borderD = getSvgPath({
            width: w - bw,
            height: h - bw,
            cornerRadius: insetR,
            cornerSmoothing,
          });
        }

        setSq({ clip, borderD, w, h });
      };

      const ro = new ResizeObserver(update);
      ro.observe(el);
      update();
      return () => ro.disconnect();
    }, [cornerRadius, cornerSmoothing, borderWidth]);

    const assignRef = (node: HTMLElement | null) => {
      (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    const hasBorder = borderWidth != null && borderWidth > 0 && sq?.borderD;

    const merged: CSSProperties = {
      ...style,
      clipPath: sq?.clip,
      position: hasBorder ? 'relative' : style?.position,
    };

    return createElement(
      Tag,
      { ref: assignRef, className, style: merged, ...rest },
      <>
        {hasBorder && (
          <svg
            aria-hidden
            width={sq!.w}
            height={sq!.h}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <path
              d={sq!.borderD}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
              transform={`translate(${borderWidth! / 2},${borderWidth! / 2})`}
            />
          </svg>
        )}
        {children}
      </>,
    );
  },
);

Squircle.displayName = 'Squircle';
