import { memo, useMemo } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type CardVariant = 'default' | 'elevated' | 'interactive' | 'formula';

const GRID_MATEMATICO_STYLE: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(8, 145, 178, 0.07) 1px, transparent 1px), ' +
    'linear-gradient(90deg, rgba(8, 145, 178, 0.07) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

const BASE =
  'relative rounded-lg border text-card-foreground ' +
  'backdrop-blur-[20px] backdrop-saturate-[1.8] ' +
  'shadow-[0_2px_12px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] ' +
  'transition-[transform,box-shadow,border-color] duration-300 ease-out';

const VARIANTES: Record<CardVariant, string> = {
  default: 'bg-[rgba(255,255,255,0.85)] border-[rgba(8,145,178,0.15)]',
  elevated:
    'bg-[rgba(255,255,255,0.92)] border-[rgba(8,145,178,0.2)] ' +
    'shadow-[0_8px_24px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.7)]',
  interactive:
    'bg-[rgba(255,255,255,0.85)] border-[rgba(8,145,178,0.15)] cursor-pointer ' +
    'hover:-translate-y-1 hover:border-[rgba(8,145,178,0.4)] ' +
    'hover:shadow-[0_12px_28px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.7)]',
  formula: 'bg-[rgba(240,249,255,0.9)] border-[rgba(8,145,178,0.15)]',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card = memo(function Card({ className, variant = 'default', style, ...props }: CardProps) {
  const estiloGrid = useMemo(
    () => (variant === 'formula' ? { ...GRID_MATEMATICO_STYLE, ...style } : style),
    [variant, style],
  );

  return (
    <div className={cn(BASE, VARIANTES[variant], className)} style={estiloGrid} {...props} />
  );
});

export const CardHeader = memo(function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
});

export const CardTitle = memo(function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-xl font-semibold leading-tight tracking-tight text-math-white', className)}
      {...props}
    />
  );
});

export const CardDescription = memo(function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-math-silver', className)} {...props} />;
});

export const CardContent = memo(function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
});

export const CardFooter = memo(function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
});
