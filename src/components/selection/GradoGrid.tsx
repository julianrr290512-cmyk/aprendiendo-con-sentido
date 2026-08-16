import { memo } from 'react';
import { motion } from 'framer-motion';
import type { GradoId } from '@/types';
import { gradosDisponibles } from '@/data/grados';
import { cn } from '@/utils/cn';

interface GradoGridProps {
  onSeleccionar: (gradoId: GradoId) => void;
  className?: string;
}

/**
 * Grilla simple de botones de grado (6to a 11mo): solo da contexto a la IA,
 * no carga contenido propio, asi que no necesita mas que un selector directo.
 */
export const GradoGrid = memo(function GradoGrid({ onSeleccionar, className }: GradoGridProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3 sm:grid-cols-6', className)}>
      {gradosDisponibles.map((grado, indice) => (
        <motion.button
          key={grado.id}
          type="button"
          onClick={() => onSeleccionar(grado.id)}
          className="flex flex-col items-center justify-center gap-1 rounded-lg border border-math-cyan/15 bg-math-navy/40 py-6 text-center transition-colors duration-200 hover:-translate-y-0.5 hover:border-math-cyan/50 hover:bg-math-navy/60"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: indice * 0.04, ease: 'easeOut' }}
        >
          <span className="font-display text-2xl font-bold text-math-white">{grado.nombre}</span>
          <span className="text-[10px] uppercase tracking-wide text-math-silver">Grado</span>
        </motion.button>
      ))}
    </div>
  );
});
