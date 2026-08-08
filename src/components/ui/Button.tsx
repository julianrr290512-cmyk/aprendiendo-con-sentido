import { forwardRef, memo, useCallback, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-medium ' +
    'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out ' +
    'cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-math-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-math-navy ' +
    'disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-math-cyan to-math-blue text-white shadow-[0_2px_8px_rgba(8,145,178,0.3)] ' +
          'hover:shadow-[0_4px_20px_rgba(8,145,178,0.4)] hover:-translate-y-px active:translate-y-0',
        secondary:
          'border border-math-cyan bg-transparent text-math-cyan ' +
          'hover:bg-math-cyan hover:text-math-navy',
        ghost: 'group bg-transparent text-math-silver hover:text-math-white',
        danger:
          'bg-gradient-to-br from-math-error to-red-800 text-white shadow-[0_2px_8px_rgba(220,38,38,0.3)] ' +
          'hover:shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:-translate-y-px active:translate-y-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant, size, loading = false, disabled, onClick, children, ...props },
    ref,
  ) {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const manejarClick = useCallback(
      (evento: MouseEvent<HTMLButtonElement>) => {
        const boton = evento.currentTarget;
        const rect = boton.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const nuevo: Ripple = {
          id: rippleId++,
          x: evento.clientX - rect.left - size / 2,
          y: evento.clientY - rect.top - size / 2,
          size,
        };
        setRipples((prev) => [...prev, nuevo]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== nuevo.id));
        }, 600);

        onClick?.(evento);
      },
      [onClick],
    );

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        onClick={manejarClick}
        {...props}
      >
        {variant === 'ghost' && (
          <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px scale-x-0 bg-math-cyan transition-transform duration-200 ease-out group-hover:scale-x-100" />
        )}

        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/50 animate-ripple"
            style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
          />
        ))}

        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        <span className={cn(loading && 'opacity-80')}>{children}</span>
      </button>
    );
  }),
);
