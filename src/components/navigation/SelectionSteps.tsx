import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const PASOS = ['Inicio', 'Grado', 'Tema'] as const;

interface SelectionStepsProps {
  /** Indice (0-based) del paso activo dentro de PASOS. */
  step: number;
  className?: string;
}

/**
 * Barra de progreso superior del flujo de seleccion. Muestra los 3 pasos
 * Inicio > Grado > Tema con el tramo recorrido relleno en degradado cyan->gold.
 */
export const SelectionSteps = memo(function SelectionSteps({ step, className }: SelectionStepsProps) {
  const porcentaje = (step / (PASOS.length - 1)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-math-midnight">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-math-cyan to-math-gold"
          initial={false}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1.5 flex justify-between">
        {PASOS.map((paso, indice) => (
          <span
            key={paso}
            className={cn(
              'text-[10px] font-medium uppercase tracking-wide transition-colors duration-300',
              indice <= step ? 'text-math-cyan' : 'text-math-silver/40',
            )}
          >
            {paso}
          </span>
        ))}
      </div>
    </div>
  );
});
