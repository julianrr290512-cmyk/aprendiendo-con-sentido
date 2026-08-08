import { memo } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * Base con shimmer (barrido de gradiente, no solo opacidad como animate-pulse).
 * Todas las instancias comparten la misma duracion/easing de `animate-shimmer`
 * (definida una sola vez en tailwind.config.ts) para que el barrido se vea
 * sincronizado cuando hay varios skeletons visibles a la vez.
 */
export const Skeleton = memo(function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-[length:200%_100%] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer',
        className,
      )}
      {...props}
    />
  );
});

export const SkeletonText = memo(function SkeletonText({
  lineas = 3,
  className,
}: {
  lineas?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lineas }).map((_, indice) => (
        <Skeleton
          key={indice}
          className={cn('h-3.5', indice === lineas - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
});

export const SkeletonCircle = memo(function SkeletonCircle({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton className={cn('rounded-full', className)} style={{ width: size, height: size }} />
  );
});

export const SkeletonBadge = memo(function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn('h-5 w-24 rounded-full', className)} />;
});

/** Mimica el bloque de una formula KaTeX en modo display dentro de un FormulaCard. */
export const SkeletonFormula = memo(function SkeletonFormula({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-4', className)}>
      <Skeleton className="h-8 w-2/3 max-w-xs" />
    </div>
  );
});

/** Mimica una Card completa: header con badge + titulo, cuerpo de texto. */
export const SkeletonCard = memo(function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-math-cyan/10 bg-math-midnight/60 p-6', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-1/2" />
        <SkeletonBadge />
      </div>
      <SkeletonText lineas={3} />
    </div>
  );
});
