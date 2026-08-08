import { memo } from 'react';
import type { ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  srcWebp: string;
  srcFallback: string;
  alt: string;
}

export const LazyImage = memo(function LazyImage({
  srcWebp,
  srcFallback,
  alt,
  width,
  height,
  ...props
}: LazyImageProps) {
  return (
    <picture>
      <source srcSet={srcWebp} type="image/webp" />
      <img
        src={srcFallback}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        {...props}
      />
    </picture>
  );
});
