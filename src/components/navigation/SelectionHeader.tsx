import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { SelectionSteps } from './SelectionSteps';

interface SelectionHeaderProps {
  step: number;
  items: BreadcrumbItem[];
  className?: string;
}

export const SelectionHeader = memo(function SelectionHeader({ step, items, className }: SelectionHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      className={className}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <SelectionSteps step={step} />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-math-cyan/20 text-math-silver transition-colors hover:border-math-cyan/50 hover:text-math-cyan"
          aria-label="Volver"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Breadcrumb items={items} />
      </div>
    </motion.header>
  );
});
