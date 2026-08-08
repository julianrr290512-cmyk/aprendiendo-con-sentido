import { memo } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'default' | 'cyan' | 'gold' | 'success' | 'error' | 'outline';

const ESTILOS: Record<BadgeVariant, string> = {
  default: 'bg-math-midnight text-math-silver border border-math-silver/20',
  cyan: 'bg-math-cyan/15 text-math-cyan border border-math-cyan/30',
  gold: 'bg-math-gold/15 text-math-gold border border-math-gold/30',
  success: 'bg-math-success/15 text-math-success border border-math-success/30',
  error: 'bg-math-error/15 text-math-error border border-math-error/30',
  outline: 'bg-transparent text-math-silver border border-math-silver/30',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/**
 * Primitiva visual generica para fuente del contenido, nivel de dificultad y logros.
 * Componentes de mas alto nivel (FuenteContenidoBadge, etc.) se apoyan en esta.
 */
export const Badge = memo(function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        ESTILOS[variant],
        className,
      )}
      {...props}
    />
  );
});
