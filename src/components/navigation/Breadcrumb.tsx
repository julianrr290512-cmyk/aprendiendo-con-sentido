import { memo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = memo(function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Ruta de navegacion" className={cn('flex flex-wrap items-center gap-1.5 text-sm', className)}>
      {items.map((item, indice) => {
        const esUltimo = indice === items.length - 1;
        return (
          <Fragment key={`${item.label}-${indice}`}>
            {indice > 0 && (
              <span className="text-math-silver/40" aria-hidden="true">
                /
              </span>
            )}
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: indice * 0.05 }}
            >
              {item.to && !esUltimo ? (
                <Link
                  to={item.to}
                  className="text-math-silver transition-colors hover:text-math-cyan"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(esUltimo ? 'font-medium text-math-white' : 'text-math-silver')}>
                  {item.label}
                </span>
              )}
            </motion.span>
          </Fragment>
        );
      })}
    </nav>
  );
});
