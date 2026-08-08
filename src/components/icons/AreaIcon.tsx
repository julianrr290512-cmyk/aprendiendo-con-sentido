import { memo } from 'react';
import type { AreaIconName } from './areaSimbolos';

interface AreaIconProps {
  nombre: AreaIconName;
  className?: string;
}

const PATHS: Record<AreaIconName, JSX.Element> = {
  sigma: (
    <path
      d="M18 6H7l6 6-6 6h11"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  triangle: (
    <path d="M12 4l9 16H3L12 4z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'bar-chart': (
    <>
      <path d="M4 20V10" strokeLinecap="round" />
      <path d="M12 20V4" strokeLinecap="round" />
      <path d="M20 20v-7" strokeLinecap="round" />
    </>
  ),
  'function-square': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M13 8h-1.5a1.5 1.5 0 00-1.5 1.5V16m-2-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  infinity: (
    <path
      d="M7 9a4 4 0 100 6 6 6 0 004-2 6 6 0 004 2 4 4 0 100-6 6 6 0 00-4 2 6 6 0 00-4-2z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </>
  ),
};

export const AreaIcon = memo(function AreaIcon({ nombre, className }: AreaIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      {PATHS[nombre] ?? PATHS.sigma}
    </svg>
  );
});
