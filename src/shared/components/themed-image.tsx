'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

type ThemedImageProps = {
  src: string;
  srcDark?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export const ThemedImage = React.forwardRef<HTMLImageElement, ThemedImageProps>(
  ({ src, srcDark, alt, width, height, className, ...rest }, forwardedRef) => {
    const { theme } = useTheme();
    const [imgSrc, setImgSrc] = React.useState(src);

    React.useEffect(() => {
      setImgSrc(theme === 'dark' && srcDark ? srcDark : src);
    }, [theme, src, srcDark]);

    return (
      <Image
        ref={forwardedRef as React.Ref<HTMLImageElement>}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...rest}
      />
    );
  },
);
ThemedImage.displayName = 'ThemedImage';
